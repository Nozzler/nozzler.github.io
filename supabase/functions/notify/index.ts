// Sends the order emails (Brevo or Resend). Called two ways, both with just the request id:
//   1. by the database trigger `notify_request` (header x-notify-key), and
//   2. by the shop / admin pages right after they create or change a request (the logged-in user's token).
// The function reads the request itself and compares it with `requests.notified` (what was already mailed), so
// it never sends the same mail twice, whichever way it was called, and still works if one of the two ways is not set up.
// Deploy:  supabase functions deploy notify --no-verify-jwt     (it checks the key / token itself)
// Mail service: set BREVO_API_KEY (works without a domain: verify one sender address) OR RESEND_API_KEY (needs a verified domain).
// Secrets: supabase secrets set BREVO_API_KEY=... (or RESEND_API_KEY=...) MAIL_FROM="Nozzler <orders@your-domain.com>" SITE_URL=https://you.github.io/your-repo NOTIFY_KEY=<select value from app_secrets where key='notify_key'>
//          (optional) SHOP_NAME=Nozzler
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided to Edge Functions automatically.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-notify-key" };
const SB = Deno.env.get("SUPABASE_URL") ?? "", SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const KEY = Deno.env.get("NOTIFY_KEY") ?? "", RESEND = Deno.env.get("RESEND_API_KEY") ?? "", BREVO = Deno.env.get("BREVO_API_KEY") ?? "", FROM = Deno.env.get("MAIL_FROM") ?? "";
const SITE = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, ""), SHOP = Deno.env.get("SHOP_NAME") ?? "Nozzler";
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
const eur = (n: unknown) => "€" + (+(n as number)).toFixed(2);
type Mail = { subject: string; body: string; btn?: [string, string] };

const wrap = (m: Mail) => `<div style="font:15px/1.5 system-ui,-apple-system,sans-serif;color:#1c1b18;max-width:520px;margin:0 auto;padding:16px">
<h2 style="margin:0 0 12px;color:#c2410c">${esc(SHOP)}</h2>${m.body}${m.btn ? `<p style="margin:20px 0"><a href="${esc(m.btn[1])}" style="background:#c2410c;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${esc(m.btn[0])}</a></p>` : ""}
<p style="color:#6d6a62;font-size:12px;margin-top:24px">You get this because of your ${esc(SHOP)} account. You can turn order emails off under Account in the shop.</p></div>`;
const plain = (h: string) => h.replace(/<br\s*\/?>|<\/p>|<\/div>|<\/h2>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\n{3,}/g, "\n\n").trim();
const items = (r: any) => ((r.options?.items) || []).map((i: any) => `${esc(i.name)} ×${i.qty || 1} · ${esc(i.m || "")}`).join("<br>") || "–";

/* to the admins: a new request arrived */
export function newOrder(r: any, c: any): Mail {
  const kv = (a: string, b: unknown) => b ? `<tr><td style="color:#6d6a62;padding:2px 12px 2px 0">${a}</td><td>${esc(b)}</td></tr>` : "";
  return { subject: `New order: ${r.name}`, btn: ["Open admin", SITE + "/admin/"], body: `<p>A new request just came in.</p><p><b>${esc(r.name)}</b><br>${items(r)}</p>
<table>${kv("Customer", c?.name)}${kv("Email", c?.email)}${kv("Phone", c?.phone)}${kv("Estimate", r.est_price != null ? eur(r.est_price) : "manual quote")}${kv("Wanted by", r.due)}${kv("Delivery", [r.delivery_method, r.delivery_where].filter(Boolean).join(": "))}${kv("Notes", r.notes)}</table>` };
}
/* to the admins: the customer accepted / cancelled */
export function customerAction(r: any, c: any): Mail {
  const w = r.status === "accepted" ? "accepted the quote" : r.status === "cancelled" ? "cancelled the request" : "declined the quote";
  return { subject: `${c?.name || "A customer"} ${w}: ${r.name}`, btn: ["Open admin", SITE + "/admin/"], body: `<p>${esc(c?.name || "A customer")} ${w} for <b>${esc(r.name)}</b>${r.quoted_price != null ? ` (${eur(r.quoted_price)})` : ""}.</p>${r.status === "accepted" ? "<p>Check the price, then press <i>Customer confirmed</i> to queue it.</p>" : ""}` };
}
/* to the customer: something changed on their order */
export function update(r: any, o: any, c: any): Mail | null {
  const L: string[] = []; let subject = "";
  const add = (s: string, t: string) => { if (!subject) subject = s; L.push(t); };
  const n = `<b>${esc(r.name)}</b>`;
  if (r.status !== o.status) {
    if (r.status === "quoted") add("Your quote is ready", `Your quote for ${n} is ready${r.quoted_price != null ? ": <b>" + eur(r.quoted_price) + "</b>" : ""}. Open My orders to accept it.`);
    else if (r.status === "in_queue") add("Your order is in the queue", `${n} is confirmed and waiting in our print queue.`);
    else if (r.status === "printing") add("We started printing", `We started printing ${n}.`);
    else if (r.status === "ready") add("Your order is ready", `${n} is ready${r.delivery_method === "pickup" ? " for pickup" : ""}${r.delivery_where ? " (" + esc(r.delivery_where) + ")" : ""}.`);
    else if (r.status === "delivered") add("Your order was delivered", `${n} is delivered. Thank you!`);
    else if (r.status === "declined") add("Update on your request", `We can't take ${n} on as requested.`);
  }
  if (r.quoted_price != null && o.quoted_price != null && +r.quoted_price !== +o.quoted_price && r.status === o.status) add("Price updated", `The price for ${n} is now <b>${eur(r.quoted_price)}</b>.`);
  if (r.paid && !o.paid) add("Payment received", `We received your payment${r.quoted_price != null ? " of " + eur(r.quoted_price) : ""} for ${n}. Thank you!`);
  if (r.admin_note && r.admin_note !== o.admin_note) add("Message about your order", `Message from the shop about ${n}:<br><i>${esc(r.admin_note)}</i>`);
  if (!L.length) return null;
  return { subject: `${subject}: ${r.name}`, btn: ["My orders", SITE + "/shop/"], body: `<p>Hi ${esc(c?.name || "there")},</p>${L.map((x) => `<p>${x}</p>`).join("")}` };
}

async function send(to: string[], m: Mail) {
  if (!to.length) return;
  const html = wrap(m);
  if (BREVO) {
    const m2 = FROM.match(/^\s*(.*?)\s*<([^>]+)>\s*$/), sender = m2 ? { name: m2[1].replace(/"/g, ""), email: m2[2] } : { email: FROM.trim() };
    const r = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": BREVO, "Content-Type": "application/json", accept: "application/json" }, body: JSON.stringify({ sender, to: to.map((email) => ({ email })), subject: m.subject, htmlContent: html, textContent: plain(html) }) });
    if (!r.ok) throw new Error("Brevo " + r.status + " " + await r.text());
    return;
  }
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + RESEND, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to, subject: m.subject, html, text: plain(html) }) });
  if (!r.ok) throw new Error("Resend " + r.status + " " + await r.text());
}

const db = (path: string, init: RequestInit = {}) => fetch(`${SB}/rest/v1/${path}`, { ...init, headers: { apikey: SVC, Authorization: "Bearer " + SVC, "Content-Type": "application/json", ...(init.headers || {}) } });
const rows = async (path: string) => { const r = await db(path); if (!r.ok) throw new Error("db " + r.status + " " + await r.text()); return await r.json(); };
const snapOf = (r: any) => ({ status: r.status, paid: !!r.paid, quoted_price: r.quoted_price ?? null, admin_note: r.admin_note ?? null });
const out = (body: string, status = 200) => new Response(body, { status, headers: cors });
const CUSTOMER_ACTIONS = ["accepted", "declined", "cancelled"];

/* who is calling: "trigger" (secret key) or a logged-in user (customer = owner of the request, admin = role admin) */
async function caller(req: Request, r: any, hint: string | null): Promise<"admin" | "customer" | null> {
  if (KEY && req.headers.get("x-notify-key") === KEY) return hint === "customer" ? "customer" : "admin";
  const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!tok) return null;
  const u = await fetch(`${SB}/auth/v1/user`, { headers: { apikey: SVC, Authorization: "Bearer " + tok } });
  if (!u.ok) return null;
  const id = (await u.json()).id as string;
  const p = (await rows(`profiles?id=eq.${id}&select=role`))[0];
  if (p?.role === "admin") return "admin";
  return id === r.user_id ? "customer" : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return out("ok");
  try {
    if ((!RESEND && !BREVO) || !FROM) throw new Error("BREVO_API_KEY (or RESEND_API_KEY) and MAIL_FROM must be set");
    const { id, actor } = await req.json();
    if (!/^[0-9a-f-]{36}$/i.test(String(id))) return out("bad id", 400);
    const r = (await rows(`requests?id=eq.${id}&select=*`))[0]; if (!r) return out("not found", 404);
    const who = await caller(req, r, actor ?? null); if (!who) return out("forbidden", 401);
    const cur = snapOf(r), old = r.notified as ReturnType<typeof snapOf> | null;
    if (old && JSON.stringify(old) === JSON.stringify(cur)) return out("nothing new");
    // claim this change first: if another call got there before us the claim fails and we send nothing
    const claim = await db("rpc/claim_notify", { method: "POST", body: JSON.stringify({ rid: id, snap: cur, expected: old }) });
    if (!claim.ok) throw new Error("claim " + claim.status + " " + await claim.text());
    if ((await claim.json()) !== true) return out("already sent");
    const admins = (await rows("profiles?role=eq.admin&email=not.is.null&select=email")).map((x: any) => x.email as string);
    const c = (await rows(`profiles?id=eq.${r.user_id}&select=name,email,phone,email_updates`))[0];
    const sent: string[] = [];
    if (!old) { await send(admins, newOrder(r, c)); sent.push("new"); }
    else {
      let o: any = old;
      if (old.status !== cur.status && who === "customer" && CUSTOMER_ACTIONS.includes(cur.status)) {
        await send(admins, customerAction(r, c)); sent.push("customer_action"); o = { ...old, status: cur.status };
      }
      const m = who === "customer" ? null : update(r, o, c);
      if (m && c?.email && c.email_updates !== false) { await send([c.email], m); sent.push("update"); }
    }
    return out("ok " + sent.join(","));
  } catch (e) { console.error(e); return out(String((e as Error).message || e), 500); }
});
