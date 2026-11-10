# 3D Print Desk

Three parts, all static files (host on GitHub Pages) plus a Supabase backend.

The site root opens the customer shop; the admin is at `/admin/` (small link in the shop footer).

| Path | What |
|---|---|
| `shop/` | Customer front end: STL/3MF upload, MakerWorld/Printables links, strength options, instant estimate, send request, login (cookie auto-login), order tracking |
| `admin/` | Your desk: bills, queue, cards, accounts + login, cloud sync, **Requests** inbox, online-model and custom-design prices on quotes |
| `shared/pricing.js` | Price rates, strength presets, STL/3MF parsing (used by both) |
| `supabase/schema.sql` | Tables, Row Level Security, storage bucket |
| `config.js` | Your Supabase URL + anon key |

## Setup
1. Create a project at supabase.com. Run `supabase/schema.sql` in the SQL Editor.
2. Put the Project URL and **anon** key in `config.js` (never the service_role key).
3. Auth > Providers > Email: turn off "Confirm email" if you want instant sign-up.
4. Sign up once in `shop/`, then run: `update profiles set role='admin' where email='you@example.com';`
5. Open `admin/` and sign in. The first sign-in uploads your local data to the cloud; other devices load it.
6. Push to GitHub, enable Settings > Pages > Source: GitHub Actions. The workflow in `.github/workflows` deploys on every push to `main`.
Local test: `python3 -m http.server` in this folder, then open `/shop/` and `/admin/`.

## How a request flows
1. Customer gets an estimate (nothing is stored unless they press send) and sends the request.
2. It arrives in **Admin > Requests**. *Prepare quote* opens the Quote tab pre-filled (add model purchase / design price); *Save as quote & send* sends the quote.
3. The customer accepts. Their contact details (name, email, phone, address) are copied onto the request at that moment; a phone number is required to accept. You see them in the request, with tap-to-call.
4. Download their file from the request, slice it in Bambu Studio / Orca, then open the request and press *Actual price from sliced file*. Drop the `.gcode.3mf` in the Quote tab and press *Update bill with this price*. The bill and the customer's tracker show the final price (you can add a note).
5. *Customer confirmed* puts it in the print queue. Queue status and paid state keep syncing to the customer's tracker.

If you already ran an older `schema.sql`, run the new one again; it is safe to re-run.

## Notes
- Prices: edit `shared/pricing.js`. Estimates are rough (volume, strength and layer height); the final price is yours.
- Admin sync stores the whole app state as one row (`app_state`), with a version check: if two devices edit at once you get a conflict prompt.
- Customer sessions are kept in cookies (`p3d-shop_*`), admin session in localStorage.

## ESP32 light box (`esp32/order_lights/order_lights.ino`)
Every 5 minutes the ESP32 asks Supabase for order counts (no names or contact data). Wiring: LED + resistor (220 Ω) from each pin to GND.
| Pin | Light | On when |
|---|---|---|
| 25 | New order | a request is `new` or `accepted` and waiting for you |
| 26 | Paid | a paid order is still to be produced |
| 27 | Urgent | **blinks** = due within 2 days, **solid** = overdue |
All three blinking together = the board can't reach Supabase. Optional buzzer: set `BUZZER` to a pin, it beeps when new orders arrive.
Setup: run the updated `schema.sql`, get the key with `select value from app_secrets where key='device_key';`, fill in the top of the sketch (WiFi, URL, anon key, device key), flash with Arduino IDE (board: ESP32 Dev Module, no extra libraries).
Only orders that came through the shop are counted, not bills you typed in by hand.

## Colours
Admin > Colors lists the colours you have (on/off, optionally per material, add your own). They are published to the shop automatically (table `public_settings`); until you publish, the shop shows a default palette. Untick "custom colour" to stop customers choosing colours you don't stock.

## Brand
Store name: **Nozzler** (by Sepp). Logo files are in `assets/` (`logo.svg` with wordmark, `icon.svg` for favicon/app icon). The shop header and favicon use them.

## Vouchers, credit and points (customer side)
- The shop's **Get a price** page has a *Credit, points & vouchers* card: tick *Use my credit*, *Use my points* (optionally an amount; 50 pts = €1) and/or type a voucher code. The estimate shows credit, then points, then the voucher % (same order as the admin Quote tab) and what the customer pays. *Account* shows their balance.
- Nothing is deducted by the customer. The choice travels with the request (`options.use`); **Prepare quote** pre-ticks credit, points and the voucher on the Quote tab, and the existing bill logic deducts and marks the voucher used when the quote is confirmed.
- The admin app publishes each account's credit/points to table `wallets` (matched by `account_id`) and the voucher list to `vouchers` whenever it syncs. Customers can read only their own wallet and check one code via `check_voucher()`. Re-run `schema.sql`, then open Admin once so the first sync fills these tables.

## Auto-estimate weight and time
- **Files:** STL, OBJ, 3MF (sliced `.gcode.3mf` gives exact grams and time) and `.gcode` are read in the browser (`shared/pricing.js`).
- **Links:** the Edge Function `supabase/functions/model-info` downloads the model file (STL/3MF) from the link on the server and hands it to the browser, which measures it like an uploaded file; the file is also stored with the request. Deploy once: `supabase functions deploy model-info`. Printables works without a login; MakerWorld needs `supabase secrets set MAKERWORLD_TOKEN=...` to download the sliced .3mf (without it you get the numbers from the design data if available); Thingiverse needs `THINGIVERSE_TOKEN`. If nothing can be fetched the customer enters weight and time by hand. Admin > Quote has an *Auto-fill from the model link* button using the same function.

## Emails (new orders, order updates, sign-up confirmation)
Supabase sends no real mail by itself, so everything below goes through one mail service. [Resend](https://resend.com) is assumed (free tier is enough): add and verify your domain there, then create an API key.

**1. Order emails** (admins get a mail for every new request and when a customer accepts or cancels; customers get mails when the quote is ready, queued, printing, ready, delivered, paid, the price changes, or you send them a message; customers can switch them off under *Account*)
1. Re-run `supabase/schema.sql`.
2. Run in the SQL Editor: `select value from app_secrets where key='notify_key';` and copy the value.
3. `supabase secrets set RESEND_API_KEY=re_xxx MAIL_FROM="Nozzler <orders@your-domain.com>" SITE_URL=https://YOU.github.io/YOUR-REPO NOTIFY_KEY=<the value from step 2>`
4. `supabase functions deploy notify --no-verify-jwt`
5. `update app_secrets set value='https://YOUR-PROJECT.supabase.co/functions/v1/notify' where key='notify_url';`
Test: send a request from the shop; every account with role `admin` should get a mail. Errors show in Supabase > Edge Functions > notify > Logs.

**2. Sign-up confirmation mail** (this is why it never arrived: Supabase's built-in mailer only sends a couple of mails per hour and only to your own team addresses)
1. Authentication > Emails > SMTP Settings > enable custom SMTP: host `smtp.resend.com`, port `465`, user `resend`, password = your Resend API key, sender = the same address as `MAIL_FROM`.
2. Authentication > URL Configuration: *Site URL* = `https://YOU.github.io/YOUR-REPO/shop/`, and add `https://YOU.github.io/YOUR-REPO/shop/**` (and `http://localhost:8000/shop/**` for testing) to *Redirect URLs*. Without this the link in the mail points to the wrong page.
3. Keep Providers > Email > *Confirm email* on. The link now brings the customer back to the shop already logged in; the login page has a *Send the email again* button.
