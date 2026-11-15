# Media Manifest

Every cinematic and product media slot in the **Heated Store** theme.

Replace placeholders in **Online Store → Themes → Customize**. Prefer Shopify-hosted images/videos. For animated GIFs that lose animation in the image picker, use the **External media URL** setting (HTTPS only) or convert to MP4/WebM.

---

## Homepage

| Slot | Section | Purpose | Aspect | Suggested resolution | Formats | Shopify setting | Focal point | Mobile crop | Animation |
|------|---------|---------|--------|----------------------|---------|-----------------|-------------|-------------|-----------|
| `HERO_MAIN` | Cinematic hero | Full-screen homepage hero | 16:9 desktop / 9:16 mobile | 2400×1350 / 1080×1920 | GIF, animated WebP, MP4, WebM, JPG/PNG | Desktop/Mobile image or video, or External media URL | Subject mid-frame, heating zones clear of left text | Keep jacket heat zones away from headline | Yes (Mode A default) |
| `CITY_CAMPAIGN` | Cinematic story | Rainy city jacket scene | 16:9 / 9:16 | 2400×1350 / 1080×1920 | GIF, MP4, WebM, JPG | Same as hero | Back of subject, architecture depth | Prefer portrait composition | Yes |
| `OUTDOOR_CAMPAIGN` | Cinematic story | Lake / outdoor jacket scene | 16:9 / 9:16 | 2400×1350 / 1080×1920 | GIF, MP4, WebM, JPG | Same | Horizon + figure | Keep figure readable on small screens | Yes |
| `EVERYDAY_CAMPAIGN` | Cinematic story | Snowy neighborhood walk | 16:9 / 9:16 | 2400×1350 / 1080×1920 | JPG + optional heat mask, or GIF/MP4 | Same + heat overlay settings | Ordinary street scale | Avoid text over heat zones | Optional Mode B overlay |
| `WELLNESS_CAMPAIGN` | Cinematic story | Intimate eye-mask / accessories | 16:9 / 4:5 | 2000×1125 or 1600×2000 | JPG + mask, or GIF/MP4 | Same | Product heating area centered | Close crop on product | Optional Mode B |
| `FEATURED_PRODUCT` | Featured product | Homepage featured PDP tease | 4:5 | 1600×2000 | JPG, GIF, MP4 | Product media or URL | Product-centered | Same | Optional |

### Built-in placeholder files

| Slot | File in `assets/placeholder-media/` |
|------|-------------------------------------|
| `HERO_MAIN` | `hero-city.gif` |
| `CITY_CAMPAIGN` | `city-campaign.gif` |
| `OUTDOOR_CAMPAIGN` | `outdoor-campaign.gif` |
| `EVERYDAY_CAMPAIGN` | `everyday-placeholder.svg` |
| `WELLNESS_CAMPAIGN` | `wellness-placeholder.svg` |
| Product cards / gallery | `product-placeholder.svg` |
| Mode B heat mask | `heat-mask-jacket.svg` |

---

## Inventory gloves (theme assets)

Located in `assets/inventory/gloves/`.

| Color | Unglow | Glow |
|-------|--------|------|
| Black | `black-gloveunglow.png` | `black-gloveglow.png` |
| Pink | `pink-gloveunglow.png` | `pink-gloveglow.png` |

Displayed in the **Gloves grid** (`#gloves`) and **Gloves product** buying section (`#product-gloves-black` / `#product-gloves-pink`), same hover glow pattern as jackets.

## Inventory jackets (theme assets)

Located in `assets/inventory/`. Used by Inventory grid / Inventory product sections and local preview.

| Color | Unglow front | Glow front | Unglow back | Glow back |
|-------|--------------|------------|-------------|-----------|
| Black | `black-unglowfront.png` | `black-glowfront.png` | `black-unglowback.png` | `black-glowback.png` |
| Red | `red-unglowfront.png` | `red-glowfront.png` | `red-unglowback.png` | `red-glowback.png` |
| Blue | `blue-unglowfront.png` | `blue-glowfront.png` | `blue-unglowback.png` | `blue-glowback.png` |

Aspect ~1199×1312. Display with `object-fit: contain` on dark stage.  
Card hover swaps unglow → glow. Click opens crossfade slideshow of all four views.

Heat zone options in UI: **2 / 4 / 8 / 9** (Shopify option name: `Heat Zones` preferred).

## Product page

| Slot | Purpose | Aspect | Suggested resolution | Formats | Setting | Notes |
|------|---------|--------|----------------------|---------|---------|-------|
| `PRODUCT_MAIN_IMAGE` | Primary gallery image | 4:5 | 1600×2000 | JPG/PNG/WebP | Product media (Admin) | First product image |
| `PRODUCT_BACK_VIEW` | Back view | 4:5 | 1600×2000 | JPG/PNG/WebP | Product media | Second image → card hover |
| `PRODUCT_DETAIL_IMAGE` | Detail crop | 4:5 or 1:1 | 1600×2000 | JPG/PNG/WebP | Product media | Gallery thumb |
| `PRODUCT_HEATING_ANIMATION` | “See the heat” demo | 4:5 | 1200×1500 | GIF/MP4/WebM | Product section: Heat demo image/URL | Align zones to real product |
| `PRODUCT_LIFESTYLE_IMAGE` | Lifestyle context | 4:5 or 16:9 | 2000×1125+ | JPG/MP4 | Product media | Optional |
| Glow pair | Card hover heat state | Match main | Match main | PNG/WebP | Media alt containing `glow` + `front`, or metafield `custom.glow_image` | |

---

## Heat modes

### Mode A — Pre-rendered (default)

Upload a finished GIF / animated WebP / MP4 / WebM.  
**Do not enable overlay animation** on the same asset (theme will not double-glow when mode is `prerendered`).

### Mode B — Static + overlay

Upload a static photograph + optional transparent heat mask.  
Configure opacity, glow, duration (3–8s), color, and desktop/mobile position.  
If alignment is inaccurate, disable animation and show the static image only.

---

## GIF → MP4 / WebM workflow

```bash
# Example with ffmpeg
ffmpeg -i campaign.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" campaign.mp4
ffmpeg -i campaign.gif -c:v libvpx-vp9 -b:v 0 -crf 32 campaign.webm
```

1. Export poster frame as JPG for reduced-motion / poster settings.
2. Upload MP4/WebM to Shopify Files or section video picker.
3. Keep GIF as fallback via External media URL only if needed.

---

## Performance rules

1. Hero loads eager; below-fold sections lazy-load.
2. Offscreen videos pause via `media-controller.js`.
3. Prefer one full-screen motion asset active at a time.
4. Always provide a static poster for `prefers-reduced-motion`.
