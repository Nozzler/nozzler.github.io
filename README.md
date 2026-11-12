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
| `config.js` | Your Supabase URL + anon key |

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



## Box labels & papers (Admin > Labels, `admin/labels.js`)
Pick an order (or press *Box labels* in a bill), set the **number of boxes** and which **part goes in which box** (parts come from the bill's plates / the customer's items; edit, add, *Split* a quantity over two boxes, *Spread evenly*, *Reset from bill*). Parts do not have to share a box.
- **On the box (per box):** delivery label (100x150 mm), top label (150x100 mm) and a cut-open seal strip (280x44 mm) that runs over top, side and bottom, with a dashed cut line and scissors on the side/bottom seam, so the box has to be cut open. Tick **↻90°** next to a label to turn it sideways (text and all) for a vertical side. Each shows the box number (`2/3`), order name and ID, customer, delivery place, due date, contents and a barcode.
- **In the box:** packing slip (per box, with checkboxes), receipt (from the bill), thank-you letter and a care card (tips follow the materials used). The last three go in the box you choose.
- **Rotate 90°:** every label type has a ↻90° tick next to it (turns the label sideways in the preview and in all exports; handy for the seal strip on a vertical box side).
- **Print style:** colour, grayscale or black & white. **Language:** English or Dutch.
- **Export:** every label as SVG, PNG (150/300/600 dpi) or vector PDF, or everything at once as one PDF, or a ZIP of SVGs/PNGs. Works offline, no libraries. Box plans are saved with your data (`S.lbl`) and sync with the cloud state.
