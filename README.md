# HoleSaler Order Manager
url: https://payment-pilot-orders.lovable.app/staff/orders

VISUAL STYLE (apply to every page, now and in later steps)

- A plain business tool in the style of the HoleSaler wireframes: dark top bar (#1f1f1f) with "HoleSaler" on the left, navigation links, and the signed-in name with Sign out on the right; light grey page background (#f7f7f7); content in white cards with a thin grey border (#d4d4d4) and 8px radius.

- Type: Inter or system sans-serif; body 14px; page title 20px semibold; section title 16px semibold. Numbers right-aligned with tabular figures.

- Tables: grey header row (#ececec), thin row borders, compact 40px rows, sticky header, a short empty-state message.

- Status pills: Awaiting payment amber, Preparing shipment blue, Shipped green, Cancelled grey. Flags as outlined pills: Unpaid 5+ days red, Refund needed purple, Reserve in use amber, Orderable 0 red.

- Messages: errors in a red box or toast (background #fdecec, text #b42318); success green (background #ecfdf3, text #067647); hints and rules as dashed grey boxes.

- Buttons: primary black (#111) with white text; secondary white with a grey border; destructive actions (cancel order, cancel payment, close account) red and always behind a confirmation dialog.

- Layout: max width 1200px; page title with a one-line description; filters above tables; record details in a right-side drawer; create and edit forms in dialogs. Desktop first, still usable on a tablet.

- Dates YYYY-MM-DD, times HH:mm, Asia/Seoul; money as ₩ with separators.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6cbdc04f-c0db-488b-9c4e-eac3930ca568).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
