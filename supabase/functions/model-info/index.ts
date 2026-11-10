// Fetches the model behind a MakerWorld / Printables / Thingiverse link and returns the FILE (STL or 3MF) to the browser,
// which measures it with the same code as an uploaded file. Browsers cannot do this themselves (CORS + login walls).
// Deploy:  supabase functions deploy model-info
// Optional secrets (supabase secrets set NAME=value):
//   MAKERWORLD_TOKEN   your MakerWorld access token, lets the function download the sliced .3mf
//   THINGIVERSE_TOKEN  a Thingiverse app token (Thingiverse gives out no files without one)
// Answers: the file (application/octet-stream), or JSON {title, profiles:[{n,w,t}] (P1S profiles only), error?} when only numbers could be found.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (o: unknown) => new Response(JSON.stringify(o), { headers: { ...cors, "Content-Type": "application/json" } });
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const MAX = 60 * 1024 * 1024;
type Pr = { n?: string; w: number; t: number };
type Found = { file?: Uint8Array; title?: string; profiles?: Pr[]; noP1S?: boolean };

async function getJson(url: string, init: any = {}) {
  const r = await fetch(url, { ...init, headers: { "User-Agent": UA, Accept: "application/json", ...(init.headers || {}) }, signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(new URL(url).hostname + " answered " + r.status);
  return r.json();
}
async function getFile(url: string) {
  if (!url.startsWith("https://")) throw new Error("bad download link");
  const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(50000) });
  if (!r.ok) throw new Error("download failed (" + r.status + ")");
  if (+(r.headers.get("content-length") || 0) > MAX) throw new Error("file is too large");
  const b = new Uint8Array(await r.arrayBuffer());
  if (b.length > MAX) throw new Error("file is too large");
  return b;
}

// MakerWorld print profiles ("instances"). Only profiles made for the Bambu Lab P1S are used: other printers
// (X1C, A1, H2D...) have different weights/times and gave wrong numbers for every profile but the first.
const SEC = /^(prediction|duration|printduration|print_duration)$/i, AMB = /^(printtime|print_time|printingtime|printing_time|estimatedtime|estimated_time)$/i;
const WK = /^(weight|filament_?weight|totalweight)$/i;
const isP1S = (o: unknown) => /(^|[^a-z0-9])p1s([^a-z0-9]|$)/i.test(JSON.stringify(o) || "");
function numbers(o: any): { w: number; t: number } | null {
  if (!o || typeof o !== "object") return null;
  const k = Object.keys(o);
  const wk = k.find((x) => WK.test(x) && typeof o[x] === "number" && o[x] > 0.5 && o[x] < 20000);
  const tk = k.find((x) => (SEC.test(x) || AMB.test(x)) && typeof o[x] === "number" && o[x] > 0);
  if (!wk) return null;
  const v = tk ? o[tk] : 0;
  return { w: Math.round(o[wk] * 10) / 10, t: tk ? Math.round(SEC.test(tk) || v >= 600 ? v / 60 : v) : 0 };
}
// the numbers of one profile: its own fields first, else the sum of its plates, else the first match anywhere inside it
function profileNumbers(inst: any, d = 0): { w: number; t: number } | null {
  const own = numbers(inst); if (own && own.t) return own;
  const plates = Array.isArray(inst?.plates) ? inst.plates.map(numbers).filter(Boolean) as { w: number; t: number }[] : [];
  if (plates.length) return { w: Math.round(plates.reduce((a, x) => a + x.w, 0) * 10) / 10, t: plates.reduce((a, x) => a + x.t, 0) };
  if (own) return own;
  if (d > 6 || !inst || typeof inst !== "object") return null;
  for (const v of Object.values(inst)) { const r = profileNumbers(v, d + 1); if (r) return r; }
  return null;
}
function p1sProfiles(d: any): { list: Pr[]; inst: any[] } {
  const list: Pr[] = [], inst: any[] = [];
  for (const i of Array.isArray(d?.instances) ? d.instances : []) {
    if (!isP1S(i)) continue;
    const n = profileNumbers(i); if (!n) continue;
    list.push({ n: String(i.title || i.name || i.profileName || "P1S profile"), w: n.w, t: n.t }); inst.push(i);
  }
  return { list, inst };
}

async function printables(id: string): Promise<Found> {
  const gql = (query: string, variables: unknown) => getJson("https://api.printables.com/graphql/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, variables }) });
  const q = await gql(`query($id:ID!){print(id:$id){name stls{id name fileSize}}}`, { id });
  const p = q.data?.print; if (!p) throw new Error("Printables model not found");
  const f = (p.stls || []).find((x: any) => !x.fileSize || x.fileSize < MAX); if (!f) throw new Error("no STL/3MF file on this model");
  const m = await gql(`mutation($id:ID!,$printId:ID!,$fileType:DownloadFileTypeEnum!,$source:DownloadSourceEnum!){getDownloadLink(id:$id,printId:$printId,fileType:$fileType,source:$source){ok errors{message} output{link}}}`,
    { id: f.id, printId: id, fileType: "stl", source: "model_detail" });
  const link = m.data?.getDownloadLink?.output?.link; if (!link) throw new Error(m.data?.getDownloadLink?.errors?.[0]?.message || "Printables gave no download link");
  return { file: await getFile(link), title: p.name };
}
async function makerworld(id: string): Promise<Found> {
  const d = await getJson(`https://makerworld.com/api/v1/design-service/design/${id}`), { list, inst } = p1sProfiles(d);
  const tok = Deno.env.get("MAKERWORLD_TOKEN");
  if (tok && inst[0]) {
    try { // download the sliced file of the first P1S profile (not simply the first profile of any printer)
      const j = await getJson(`https://makerworld.com/api/v1/design-service/instance/${inst[0].id}/f3mf?type=download`, { headers: { Authorization: "Bearer " + tok } });
      if (j.url) return { file: await getFile(j.url), title: d.title, profiles: list };
    } catch (_) { /* fall back to the numbers from the design data */ }
  }
  return { title: d.title, profiles: list, noP1S: !list.length };
}
async function thingiverse(id: string): Promise<Found> {
  const tok = Deno.env.get("THINGIVERSE_TOKEN"); if (!tok) throw new Error("Thingiverse needs a THINGIVERSE_TOKEN secret on the function");
  const files = await getJson(`https://api.thingiverse.com/things/${id}/files`, { headers: { Authorization: "Bearer " + tok } });
  const f = (files || []).find((x: any) => /\.(stl|3mf)$/i.test(x.name) && (x.size || 0) < MAX); if (!f) throw new Error("no STL/3MF file on this thing");
  return { file: await getFile(f.direct_url || f.download_url || f.public_url) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { url } = await req.json(), u = new URL(url), h = u.hostname.replace(/^www\./, "");
    let found: Found = {}, err = "";
    try {
      if (h.endsWith("printables.com")) { const m = u.pathname.match(/\/model\/(\d+)/); if (m) found = await printables(m[1]); }
      else if (h.endsWith("makerworld.com")) { const m = u.pathname.match(/\/models\/(\d+)/); if (m) found = await makerworld(m[1]); }
      else if (h.endsWith("thingiverse.com")) { const m = u.pathname.match(/thing:(\d+)/); if (m) found = await thingiverse(m[1]); }
      else return json({ error: "This site is not supported (MakerWorld, Printables, Thingiverse)", profiles: [] });
    } catch (e) { err = String((e as Error).message || e); }
    if (found.file) return new Response(found.file, { headers: { ...cors, "Content-Type": "application/octet-stream" } });
    return json({ title: found.title || "", profiles: found.profiles || [], error: err || (found.profiles?.length ? "" : found.noP1S ? "No print profile for the Bambu Lab P1S on that page" : "Could not find the model file or its print numbers") });
  } catch (e) { return json({ error: String(e), profiles: [] }); }
});
