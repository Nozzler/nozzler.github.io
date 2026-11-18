# 3D Print Desk

Three parts, all static files (host on GitHub Pages) plus a Supabase backend.

The site root opens the customer shop; the admin is at `/admin/` (small link in the shop footer).

| Path | What |
|---|---|
| `shop/` | Customer front end: STL/3MF upload, MakerWorld/Printables links, strength options, instant estimate, send request, login (cookie auto-login), order tracking |
| `admin/` | Your desk: bills, queue, cards, accounts + login, cloud sync, **Requests** inbox, online-model and custom-design prices on quotes |
| `admin/labels.js` | **Labels** tab: box labels and papers (see below) |
| `shared/pricing.js` | Price rates, strength presets, STL/3MF parsing (used by both) |
| `supabase/schema.sql` | Tables, Row Level Security, storage bucket |
| `config.js` | Your Supabase URL + anon key (+ the public VAPID key for notifications) |
| `sw.js` | Service worker (root): receives push messages, opens the right page on tap |
| `shared/push.js`, `shared/mobile.css` | Notification switch (shop + admin) and the mobile layout pass |
| `admin/manifest.webmanifest`, `shop/manifest.webmanifest` | Make both installable as phone apps |
| `supabase/push.sql`, `supabase/functions/push-notify` | Subscription table + the function that sends the pushes |
| `tools/patch_admin.py` | One-time patch for `admin/index.html` (mobile + push) |

## Setup
1. Create a project at supabase.com. Run `supabase/schema.sql` in the SQL Editor.
2. Put the Project URL and **anon** key in `config.js` (never the service_role key).
3. Auth > Providers > Email: turn off "Confirm email" (instant sign-up, no verification emails).
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
- Prices: edit `shared/pricing.js`. Estimates are rough (volume, strength and layer height); the final price is yours. Customers only see a rounded range (about ±10%), never the rates or a breakdown. Bigger jobs get a small size discount in the estimate (about 6% at 500 g, capped at 12% from 5 kg; see `sizeFactor`). Note: the rates are still readable in the public `shared/pricing.js` source; for full secrecy the estimate would have to move to an Edge Function.
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
- **Links:** the Edge Function `supabase/functions/model-info` downloads the model file (STL/3MF) from the link on the server and hands it to the browser, which measures it like an uploaded file; the file is also stored with the request. Deploy once: `supabase functions deploy model-info`. Printables works without a login; MakerWorld only uses print profiles made for the **Bambu Lab P1S** (other printers' profiles are ignored; if the page has none you enter weight and time by hand). `MAKERWORLD_TOKEN` (`supabase secrets set MAKERWORLD_TOKEN=...`) downloads the sliced .3mf of the first P1S profile (without it you get the numbers from the design data); Thingiverse needs `THINGIVERSE_TOKEN`. If nothing can be fetched the customer enters weight and time by hand. Admin > Quote has an *Auto-fill from the model link* button using the same function.



## Box labels & papers (Admin > Labels)
Files: `admin/labels.js` (engine + UI) and `admin/labels.defaults.js` (brand, colours, texts and every label template as JSON).

**Make labels**: pick an order (or press *Box labels* in a bill), set the number of boxes and which part goes in which box (parts need not share a box; *Split*, *Spread evenly*, *Reset from bill*). Tick the labels you want; each has ↻90° (turns the whole label, text included), a copies counter and a ⚙ shortcut to its settings. Style: colour / grayscale / B&W, language EN / NL.
Export: one PDF (copies repeated), **print sheets** (labels packed at real size on A4 / A5 / A3 / Letter, optional cut guides), or a ZIP of SVG / PNG (150-600 dpi). Each preview also has its own SVG / PNG / PDF button.

| Group | Templates |
|---|---|
| On the box | Delivery label, Top label, Cut-open seal (cut line on the side/bottom seam), Bottom & side seal (logo + cut line; lengths are settings), Lid thank-you seal (brand, headline, vertical THANK YOU, hearts, social lines, optional cut line), Fragile label, Keep away from heat, Keep dry, This side up, Open here, Box number sticker, Return address label, Website sticker, Seal dot (round, logo only), Gift tag, Thank-you tape strip, Fragile tape strip, Brand banner strip |
| In the box | Packing slip, Parts & boxes overview (every part with its box), Receipt, Thank-you letter, Thank-you postcard, Mini thank-you card, Bookmark, Care card, Help & contact card, Review request card, Print passport (credit-card size), Handwritten note card, Quality-checked sticker, Round thank-you sticker, Heart sticker (round) |
| Per part | Part tag (one per part: name, details, qty, box) |
| Workshop (internal) | Job ticket, Pack checklist, Quality check sheet, Pickup tag |

**Parts come from the order by themselves**: the customer's request items first (name, quantity, colour, material), else the print plates, else the bill. The request is found through the bill's request id or the request's own `bill_id`. In automatic mode the part names, details and quantities are shown (not typed) and only the box is yours to choose; use *Split* to share a quantity over boxes. The list follows the order: when customer requests finish loading from the cloud, or the order changes, the Labels tab updates by itself (it never interrupts a field you are typing in) and your box choices and splits are kept by part name. *Edit by hand* switches to manual (parts you add by hand always stay); *Sync with order* goes back to automatic. Raising the box count spreads the parts over the boxes, and the tab opens on the latest order that is not delivered yet.

**Templates**: every label is JSON (`id, name, group, per, w, h, vars, elements`). Open the *Templates* tab to change a template's settings (for example the seal's cut-line position), edit its JSON with a live check (a template with a mistake is never applied), duplicate it, or start a new one. Elements: rect, line, poly, text, para, stack, parts, bars, logo, tips, rc (receipt), rep (repeat). Numbers can be expressions (`"W-10"`, `"barcode?118:H-8"`) and text can use `{{id}}`, `{{name}}`, `{{customer}}`, `{{box}}`, `{{boxes}}`, `{{brand.name}}`, `{{t.<text key>}}` and so on. The *JSON* tab has a short reference.

**Look & text**: brand name, wordmark, tagline, signature, footer, return address, contact and web lines, the colour palette and all texts (EN and NL). The web line defaults to Nozzler.github.io.
**JSON**: everything you change is saved as sparse overrides (`S.lblcfg`) on top of the defaults file, so updating `labels.defaults.js` never wipes your changes. Download or import the overrides, download the full config, or reset.

## Design system (`shared/ui.css`)
Built from Apple's fluid-interface principles. Colours, radii, springs (`--smooth`, `--snap`, `--bounce` as CSS `linear()` curves) and type are tokens at the top of `shared/ui.css`; change them there and both shop and admin follow. Press feedback fires on pointer-down, popovers grow from the button that opened them, the nav indicator and switches are spring-driven, and `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast` each get their own gentler path. The theme toggle is remembered (`p3dth`).


## Phone notifications (Web Push)
Admin gets a push for every **new request** and every **accepted quote**; customers get one when their quote is ready, the status changes (queue, printing, ready, delivered), the shop sends a message, or the final price changes.
1. `npx web-push generate-vapid-keys`. Put the **public** key in `config.js` (`VAPID_PUBLIC_KEY`).
2. Run `supabase/push.sql` in the SQL Editor.
3. `supabase secrets set VAPID_PUBLIC=<public> VAPID_PRIVATE=<private> VAPID_SUBJECT=mailto:you@example.com PUSH_WEBHOOK_SECRET=<any long random string>` then `supabase functions deploy push-notify --no-verify-jwt`.
4. Supabase > Database > Webhooks > create: table `requests`, events **Insert** and **Update**, type *Supabase Edge Functions* > `push-notify`, add HTTP header `x-webhook-secret` with the same secret.
5. On the phone: **Android** open the site in Chrome. **iPhone (iOS 16.4+)**: Safari > Share > *Add to Home Screen*, then open it from the Home Screen (iOS only allows push for installed apps). Admin: Settings > *Notifications on this phone*. Customers: Account > Notifications.
Who is an admin is read from `profiles.role` on the server. Dead subscriptions are removed automatically. Pushes need HTTPS (GitHub Pages is fine).

## Mobile layout
`shared/mobile.css` (loaded after `ui.css`): admin tables become cards under 640 px, the header fits one row with a sync status dot, 16 px inputs (no iOS zoom), sheets respect the safe area and hide the tab bar, and the shop keeps the price range and *Send request* in a bar above the tab bar. Admin bottom tabs: Queue, Requests, Scan, Deliver, More.
