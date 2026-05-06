# Shop Pages + Admin Product Manager

Build the storefront and product management now. Stripe checkout is deferred — for now, "checkout" will create an enquiry/order record so you can follow up manually. Stripe can be slotted in later without rebuilding anything.

## Scope

1. **Database**: products + product_variants + shop_orders + shop_order_items tables
2. **Admin UI**: new "Shop Products" tab in CRM to create/edit/delete products
3. **Customer UI**: `/shop` listing, `/shop/:slug` product detail, cart drawer, `/checkout` (collects info → creates order record), `/order-submitted` confirmation
4. **Navbar**: add "Shop" link

## Database Schema

### `products`
- `id` uuid pk
- `slug` text unique (URL handle, e.g. `custom-jersey-pro`)
- `name`, `description` text
- `category` text (e.g. Long Sleeve, Singlet, Collared, Standard)
- `base_price` numeric (MYR)
- `images` text[] (array of image URLs)
- `is_active` bool default true
- `display_order` int default 0
- `created_at`, `updated_at`, `created_by`

### `product_variants` (optional per-product, for size/fabric/collar)
- `id`, `product_id` fk
- `option_type` text (e.g. "size", "fabric", "collar")
- `option_value` text (e.g. "M", "Interlock", "Polo")
- `price_delta` numeric default 0 (added to base price)
- `is_active` bool

### `shop_orders`
- `id`, `order_number` text (auto), `status` text default 'pending'
- `customer_name`, `customer_phone`, `customer_email`, `shipping_address` text
- `subtotal`, `shipping_fee`, `total_amount` numeric
- `notes` text, `created_at`
- `payment_status` text default 'unpaid' (placeholder for future Stripe)

### `shop_order_items`
- `id`, `order_id` fk
- `product_id`, `product_name`, `selected_options` jsonb
- `quantity` int, `unit_price`, `line_total` numeric

### RLS
- `products`: public SELECT for active products; admin/superadmin INSERT/UPDATE/DELETE
- `product_variants`: same as products
- `shop_orders` & `shop_order_items`: anon INSERT (so guests can checkout); authenticated SELECT (admins view all)

### Storage
- New public bucket `product-images` for admin uploads

## Admin UI — `src/components/crm/ShopProductsTab.tsx`
- Table of products with image thumbnail, name, category, price, active toggle
- "Add Product" dialog: name, slug (auto from name), category dropdown, description, base price, images (upload to bucket), variants editor (rows of type/value/price delta)
- Edit/delete per row
- Add tab to `src/pages/CRM.tsx`

## Customer UI

### `/shop` (`src/pages/Shop.tsx`)
- Hero, category filter chips, product grid (card with image, name, price from `base_price`, "View" link)
- Reuse styling patterns from `Catalogue.tsx`

### `/shop/:slug` (`src/pages/ShopProduct.tsx`)
- Image gallery, name, description, price (updates as variants chosen)
- Variant selectors (grouped by `option_type`)
- Quantity input
- "Add to Cart" → cart context

### Cart (`src/contexts/CartContext.tsx` + `src/components/shop/CartDrawer.tsx`)
- localStorage persistence
- Slide-out drawer accessible from navbar (cart icon + count badge)
- Line items, remove, qty change, subtotal, "Checkout" button

### `/checkout` (`src/pages/Checkout.tsx`)
- Form: name, phone, email, shipping address, notes
- Order summary
- Submit → inserts `shop_orders` + `shop_order_items` → redirect to `/order-submitted`
- Note shown to customer: "We will contact you shortly to confirm payment details" (since Stripe not wired yet)

### `/order-submitted` (`src/pages/OrderSubmitted.tsx`)
- Order number, summary, thank-you message

## Navbar & Routes
- Add `/shop`, `/shop/:slug`, `/checkout`, `/order-submitted` routes in `App.tsx`
- Add "Shop" link + cart icon in `Navbar.tsx`

## CRM — Shop Orders Tab (lightweight, included now)
- New `ShopOrdersTab.tsx`: list of incoming shop orders, click to view items + customer info, mark status (pending → contacted → paid → shipped → completed)

## Future Stripe Hook-In (deferred)
- `Checkout.tsx` already collects everything Stripe needs
- When ready: add edge function to create Stripe Checkout Session from cart, swap submit handler to redirect to Stripe, add webhook to mark `payment_status = 'paid'`
- No schema changes needed at that point

## Out of Scope (this round)
- Stripe / live payments
- Inventory/stock counts (can add later)
- Discount codes, shipping rate calculator (flat fee or "TBD" for now — confirm below)

---

**One quick decision before I build**: how do you want to handle **shipping cost** at checkout?
- (a) Flat rate (e.g. RM10 West MY / RM20 East MY)
- (b) Free shipping for now
- (c) "Calculated after order — we'll contact you" (no fee shown)

If you don't specify, I'll go with **(c)** since you'll be manually following up anyway pre-Stripe.