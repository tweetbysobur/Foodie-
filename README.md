# Foodie

Customer app for a Nigerian food delivery service. Mobile first, responsive up to desktop.
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Lucide icons.

## Run

    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start

Add `?simulate=error` to any URL to see the error state with retry.

## What works

- Welcome: first name, phone and delivery address, saved on this device.
- Home: greeting, address picker, category filter, first-order promo, best sellers, order again.
- Search: meals, vendors and categories, suggestions while typing, recent searches, filters (price, delivery time, rating, availability) and sorting.
- Dish page: photo, vendor, price, rating, prep time, options, quantity, special instructions, favourite.
- Cart: quantities, remove, per-dish instructions, subtotal, delivery fee per vendor, discount, total.
- Checkout: address, contact details with phone validation, order summary, payment method, promo code, place order.
- Orders: history, live status timeline, reorder in one tap.
- Favourites, profile photo, saved addresses, payment preference, account settings, log out.
- Loading skeletons, empty states, error states, toasts.

## Honest limits of this prototype

- Menu, vendors, ratings and prep times are sample data in `src/lib/mock-data.ts`.
- Payment: only pay on delivery works. Card and bank transfer show "Soon". Nothing is charged and no payment is ever shown as successful. See `src/lib/payments.ts` for the provider interface.
- Vendors and riders are not connected, so a placed order is saved on the device only. The confirmation and tracking screens say so. Set `VENDORS_CONNECTED` in `src/lib/order-status.ts` once orders reach vendors.
- Tracking stays at "Order placed" until a backend sends real status. For demos, run with `NEXT_PUBLIC_DEMO_TRACKING=1` to walk the stages on a timer; the screen labels it as a demo.
- Customers can cancel until the vendor confirms.
- Notifications, help, terms and privacy are marked "Soon" until real content exists.
- Promo code GENTLE gives 10% off the first order, capped at ₦5,000.

## Going live with Supabase

All reads go through `src/lib/api.ts`, and all types live in `src/lib/types.ts`. Their field names match these planned tables:

| Table | Replaces |
|---|---|
| vendors | `VENDORS` |
| menu_items, option_groups, option_choices | `MENU` |
| promo_codes | `PROMOS` in `src/lib/promo.ts` |
| profiles (linked to auth.users), addresses | profile and addresses in local storage |
| orders, order_items | orders in local storage |
| favourites | favourites in local storage |

Swap each function body in `api.ts` for a Supabase query and keep the return types. Move order placement to a server action that re-prices the cart on the server, because client totals cannot be trusted. Subscribe to `orders.status` for tracking and remove the demo timer.

## Brand

- Logo and app mark: `public/brand/`. 3D renders made with Figma AI, kept in the Figma file "Foodie · Brand and app".
- Colours and contrast notes: `src/app/globals.css`. #FF7138 fails contrast with white text (2.74:1), so text-bearing orange uses #CF4510 (4.65:1).

## Food photos

From Wikimedia Commons under open licences. Credits show in the app under Profile, Photo credits, and in `src/lib/mock-data.ts`. Keep the credits if you keep the photos.

## Design system: "Buka board"

The look comes from Nigerian buka menu boards: dishes as printed lines with dotted leaders to the price, big tight headings, flat surfaces, rules instead of cards.

- Type: Bricolage Grotesque for the wordmark, headings, dish names and prices. DM Sans for body, labels, buttons and navigation.
- Shape: 6px corners at most, no card shadows, flat tab bar with a hairline.
- Colour: forest green, burnt orange (#D94B18) for emphasis, cream ground. Contrast is measured and noted in `src/app/globals.css`.
- Photos: only the seven strongest dish photos are used. Other dishes show as text rows. Replace or add photos in `public/food/` and `src/lib/mock-data.ts`.
- Scale utilities (`t-display`, `t-page`, `t-section`, `t-card`, `t-body`, `t-support`, `t-button`, `t-price`, `t-nav`) live in `src/app/globals.css`; components and their states in `src/components/ui.tsx`.
