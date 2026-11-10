// Reads weight (g) and print time from a MakerWorld / Printables / Thingiverse / Cults page.
// Deploy:  supabase functions deploy model-info      (browsers cannot read these pages directly because of CORS)
// Best effort: it looks for print-profile data embedded in the page (JSON) and falls back to the visible text.
const OK = /(^|\.)(makerworld\.com|printables\.com|thingiverse\.com|cults3d\.com)$/i;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const out = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
type Pr = { n?: string; w: number; t: number };
const SEC = /^(prediction|duration|printduration|print_duration)$/i, AMB = /^(printtime|print_time|printingtime|printing_time|estimatedtime|estimated_time)$/i;

function walk(o: any, res: Pr[], d = 0) {
  if (!o || typeof o !== "object" || d > 14 || res.length >= 8) return;
  if (!Array.isArray(o)) {
    const k = Object.keys(o);
    const wk = k.find((x) => /^(weight|filament_?weight|totalweight)$/i.test(x) && typeof o[x] === "number" && o[x] > 0.5 && o[x] < 20000);
    const tk = k.find((x) => (SEC.test(x) || AMB.test(x)) && typeof o[x] === "number" && o[x] > 0);
    if (wk && tk) {
      const v = o[tk], min = SEC.test(tk) || v >= 600 ? v / 60 : v;
      res.push({ n: o.title || o.name || o.profileName, w: Math.round(o[wk] * 10) / 10, t: Math.round(min) });
    }
  }
  for (const v of Object.values(o)) walk(v, res, d + 1);
}

function fromText(html: string): Pr[] {
  const t = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
  const w = t.match(/(?:filament|weight)[^0-9]{0,40}(\d+(?:\.\d+)?)\s?g\b/i) || t.match(/(\d+(?:\.\d+)?)\s?g\s+(?:of\s+)?filament/i);
  const m = t.match(/(?:print(?:ing)?\s*time|estimated\s*time)[^0-9]{0,30}(?:(\d+)\s*d\w*\s*)?(?:(\d+)\s*h\w*\s*)?(?:(\d+)\s*m\w*)?/i);
  const min = m ? (+(m[1] || 0)) * 1440 + (+(m[2] || 0)) * 60 + (+(m[3] || 0)) : 0;
  return w ? [{ w: +w[1], t: min }] : [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { url } = await req.json(), u = new URL(url);
    if (u.protocol !== "https:" || !OK.test(u.hostname)) return out({ error: "unsupported site" }, 400);
    const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 (compatible; NozzlerBot/1.0)", "Accept-Language": "en" }, signal: AbortSignal.timeout(8000) });
    if (!OK.test(new URL(r.url).hostname)) return out({ error: "redirected" }, 400);
    const html = (await r.text()).slice(0, 3_000_000), res: Pr[] = [];
    for (const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)) {
      const s = m[1].trim();
      if (s[0] !== "{" && s[0] !== "[") continue;
      try { walk(JSON.parse(s), res); } catch (_) { /* not JSON */ }
    }
    const profiles = (res.length ? res : fromText(html)).filter((p, i, a) => a.findIndex((q) => q.w === p.w && q.t === p.t) === i).slice(0, 6);
    const title = (html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i) || [])[1] || "";
    return out({ title, profiles });
  } catch (e) { return out({ error: String(e) }, 500); }
});
