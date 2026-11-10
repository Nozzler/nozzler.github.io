// Sends the order emails through Resend. Called only by the database trigger `notify_request` (see schema.sql).
// Deploy:  supabase functions deploy notify --no-verify-jwt
// Secrets: supabase secrets set RESEND_API_KEY=... MAIL_FROM="Nozzler <orders@your-domain.com>" SITE_URL=https://you.github.io/your-repo NOTIFY_KEY=<select value from app_secrets where key='notify_key'>
//          (optional) SHOP_NAME=Nozzler
const KEY = Deno.env.get("NOTIFY_KEY") ?? "", RESEND = Deno.env.get("RESEND_API_KEY") ?? "", FROM = Deno.env.get("MAIL_FROM") ?? "";
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
  const html = wrap(m);
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + RESEND, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to, subject: m.subject, html, text: plain(html) }) });
  if (!r.ok) throw new Error("Resend " + r.status + " " + await r.text());
}

Deno.serve(async (req) => {
  if (!KEY || req.headers.get("x-notify-key") !== KEY) return new Response("forbidden", { status: 401 });
  try {
    const { kind, to, request: r, old: o, customer: c } = await req.json();
    if (!RESEND || !FROM) throw new Error("RESEND_API_KEY / MAIL_FROM not set");
    const m = kind === "new" ? newOrder(r, c) : kind === "customer_action" ? customerAction(r, c) : update(r, o || {}, c);
    if (m && to?.length) await send(to, m);
    return new Response("ok");
  } catch (e) { console.error(e); return new Response(String((e as Error).message || e), { status: 500 }); }
});
