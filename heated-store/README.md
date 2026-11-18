# Heated Store — Shopify Online Store 2.0 Theme

Premium heated apparel & wellness theme. Cinematic monochrome campaign presentation with a restrained orange heating signature.

**Stack:** Liquid · HTML5 · modern CSS · vanilla JS · JSON templates · sections/blocks · theme settings

---

## Quick start

### Option A — Shopify CLI (recommended)

```bash
# Install CLI if needed: https://shopify.dev/docs/api/shopify-cli
npm install -g @shopify/cli @shopify/theme

cd heated-store
shopify theme dev --store YOUR_STORE.myshopify.com
```

This uploads the theme to a development preview and opens a live URL.

### Option B — ZIP upload

1. Zip the **contents** of `heated-store/` (assets, config, layout, locales, sections, snippets, templates — not the parent folder name if Shopify expects root theme files).
2. Shopify Admin → **Online Store → Themes → Add theme → Upload zip file**.
3. Click **Customize** to assign collections, products, and media.

### Option C — Local visual preview (no Shopify)

```bash
cd heated-store && python3 -m http.server 8765
```

- Campaign homepage: http://127.0.0.1:8765/preview/
- Inventory (hover glow + slideshow + heat zones): http://127.0.0.1:8765/preview/inventory.html

Cart/product Liquid objects will not function in this static preview.

---

## Theme structure

```
heated-store/
├── assets/                 # CSS, JS, placeholder media
├── config/                 # settings_schema.json, settings_data.json
├── layout/theme.liquid
├── sections/               # Header, footer, cinematic, product, cart…
├── snippets/               # Media, heat, product-card, cart-drawer…
├── templates/              # index, product, collection, cart, pages, 404
├── locales/en.default.json
├── MEDIA_MANIFEST.md
└── README.md
```

---

## Brand system

| Token | Value |
|-------|-------|
| Background black | `#0B0B0B` |
| Soft black | `#171717` |
| White | `#FFFFFF` |
| Editorial off-white | `#FAFAF8` |
| Muted gray | `#8A8A8A` |
| Heat orange | `#FF5A1F` |
| Warm amber | `#FFB347` |
| Deep heat | `#D62828` |

Typography: **Cormorant Garamond** (editorial headings) + **DM Sans** (UI/body). Editable in theme settings.

Philosophy: *Cold is the environment. Warmth is the experience.*

---

## Homepage

Full-screen cinematic sections only — no feature grids or urgency badges.

1. **Cinematic hero** — `FROSTBYT. REDEFINED.`
2. **City** — rainy campaign
3. **Outdoors** — lake / fog campaign
4. **Jackets grid** — black / red / blue hover-glow inventory
5. **Jacket product** — gallery + size / heat-zone options
6. **Gloves grid** — black / pink hover-glow inventory
7. **Gloves product** — gallery + size / color options
8. **Featured product** — optional PDP tease

Reorder, hide, or duplicate sections in the Theme Editor.

---

## Replacing campaign media

1. Open **Customize →** select a cinematic section.
2. Upload **Desktop image** / **Mobile image** or **Desktop/Mobile video**.
3. For animated GIFs that don’t animate after upload, paste an HTTPS URL into **External media URL**.
4. Set **Media focal position** (e.g. `center top`).
5. Choose **Heat mode**:
   - `Pre-rendered` for finished GIF/MP4 (default)
   - `Overlay` for static photo + heat mask
6. See `MEDIA_MANIFEST.md` for every slot.

Placeholder GIFs already live in `assets/placeholder-media/` and display until you upload store media.

---

## Products & metafields

Create metafields under namespace `custom` (Product):

| Key | Use |
|-----|-----|
| `heating_zones` | Specs accordion |
| `heat_settings` | Specs |
| `battery_capacity` | Specs |
| `battery_included` | Battery & charger disclosure |
| `package_contents` | Package contents |
| `tested_runtime` | Specs (include test conditions) |
| `charging_info` | Specs |
| `material` | Specs |
| `washing_instructions` | Specs |
| `weather_resistance` | Specs |
| `warranty` | Specs |
| `care_instructions` | Care accordion |
| `faq` | FAQ accordion |
| `shipping_info` | Shipping (else theme default) |
| `returns_info` | Returns (else theme default) |
| `size_guide` | Size guide modal HTML/text |

Empty metafields are hidden — nothing fabricated is shown.

---

## Pages to create in Admin

Create these pages and assign templates where noted. See [`docs/POLICY_STATUS.md`](./docs/POLICY_STATUS.md) before publishing legal copy.

| Page | Handle | Template |
|------|--------|----------|
| About | `about` | `page.about` |
| Contact | `contact` | `page.contact` |
| Our Technology | `our-technology` | `page.our-technology` |
| Shipping & Delivery | `shipping-and-delivery` | `page.shipping-and-delivery` |
| Returns, Refunds & Exchanges | `returns-refunds-exchanges` | `page.returns-refunds-exchanges` |
| Warranty | `warranty` | `page.warranty` |
| Cookie Policy | `cookie-policy` | `page.cookie-policy` |
| Product Safety & Care | `product-safety-and-care` | `page.product-safety-and-care` |
| Your Privacy Choices | `privacy-choices` | `page.privacy-choices` |
| Accessibility | `accessibility` | `page.accessibility` |
| Shipping and Returns (legacy) | `shipping-and-returns` | `page.shipping-and-returns` |
| Privacy / Terms | Shopify Policies | native policy pages |

Also set Theme settings → Brand: legal business name, address, support email, privacy email.

Navigation: create a **main-menu** with Shop, Jackets, Accessories, Our Technology.

Suggested collections: `jackets`, `accessories`, plus all products.

---

## Cart & checkout

- Add to cart via Shopify Cart AJAX API
- Slide-out **cart drawer** (toggle in theme settings)
- Full **cart page** with quantity update / remove
- Checkout button posts to **native Shopify checkout**
- No custom payment processor

---

## Accessibility & motion

- Skip link, semantic landmarks, focus states
- `prefers-reduced-motion: reduce` disables heat pulse, scroll indicator motion, and autoplay video (poster/static shown)
- Keyboard-usable menu, cart drawer, size guide

---

## Performance notes

- Hero media: eager + high fetch priority
- Below-fold: lazy-load; videos pause when offscreen
- No third-party JS libraries
- Convert large GIFs to MP4/WebM before production (see MEDIA_MANIFEST)

---

## Validation

```bash
# If Shopify CLI + Theme Check are installed:
shopify theme check
```

Without a connected store, Liquid rendering, cart AJAX, and checkout cannot be fully tested locally. Static CSS/JS/HTML structure can be reviewed via `preview/index.html`.

---

## What remains placeholder until you launch

- Campaign photography beyond the three included GIFs
- Everyday / wellness SVG panels
- Product images, prices, inventory (from Shopify Admin)
- Real shipping, returns, legal, and contact copy
- Logo and social URLs
- Metafield specifications

Do not publish with invented certifications, medical claims, or fake reviews.
