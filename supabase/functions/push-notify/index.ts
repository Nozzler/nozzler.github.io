// Sends Web Push messages when a row in `requests` changes. Called by a Supabase Database Webhook (INSERT + UPDATE on public.requests).
// Who is an admin is read from `profiles.role` on the server, never from the client.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
webpush.setVapidDetails(Deno.env.get("VAPID_SUBJECT") || "mailto:admin@example.com", Deno.env.get("VAPID_PUBLIC")!, Deno.env.get("VAPID_PRIVATE")!);

const STATUS: Record<string, string> = {
  quoted: "Your quote is ready", in_queue: "Your order is in the print queue", printing: "Your order is printing now",
  ready: "Your order is ready", delivered: "Your order was delivered", declined: "Your request was declined", cancelled: "Your request was cancelled",
};
type Msg = { title: string; body: string; url: string; tag?: string };

async function send(userIds: string[], m: Msg) {
  if (!userIds.length) return;
  const { data } = await sb.from("push_subscriptions").select("*").in("user_id", userIds);
  await Promise.all((data || []).map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } }, JSON.stringify(m), { TTL: 86400, urgency: "high" });
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) await sb.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      else console.error("push failed", e.statusCode, e.body);
    }
  }));
}
const admins = async () => ((await sb.from("profiles").select("id").eq("role", "admin")).data || []).map((x) => x.id);

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("PUSH_WEBHOOK_SECRET")) return new Response("forbidden", { status: 403 });
  try {
    const { type, record: r, old_record: o } = await req.json();
    const name = r?.name || "request";
    if (type === "INSERT") {
      await send(await admins(), { title: "New request", body: name, url: "admin/#Requests", tag: "req-" + r.id });
    } else if (type === "UPDATE" && o) {
      if (r.status !== o.status) {
        if (r.status === "accepted") await send(await admins(), { title: "Quote accepted", body: name, url: "admin/#Requests", tag: "req-" + r.id });
        else if (STATUS[r.status]) await send([r.user_id], { title: STATUS[r.status], body: name, url: "shop/#orders", tag: "ord-" + r.id });
      } else if (r.admin_note && r.admin_note !== o.admin_note) {
        await send([r.user_id], { title: "Message from the shop", body: r.admin_note, url: "shop/#orders", tag: "note-" + r.id });
      } else if (r.quoted_price !== o.quoted_price && ["accepted", "in_queue", "printing", "ready"].includes(r.status)) {
        await send([r.user_id], { title: "Final price updated", body: name + ": €" + Number(r.quoted_price).toFixed(2), url: "shop/#orders", tag: "price-" + r.id });
      }
    }
  } catch (e) { console.error(e); }
  return new Response("ok");   // always 200 so the webhook does not retry-storm
});
