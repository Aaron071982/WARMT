# Frostbyt customer-information status

This is an implementation and audit report, **not** a compliance certificate.
Pages and controls exist as theme infrastructure. Verified business and product facts are still required before public launch.

## 1. Summary of changes

- Larger Frostbyt logo in header and footer.
- Footer reorganized into **Support**, **Product**, and **Legal & Privacy**.
- Persistent **Cookie Preferences** control.
- Legal/info page templates with incomplete-state outlines (no invented legal copy).
- Cookie banner + preferences UI wired to Shopify Customer Privacy API when available.
- Product page slots for package contents, battery/charger disclosure, and links to shipping / returns / warranty / safety.
- Theme settings fields for legal business name, address, support email, and privacy email (empty until provided).

## 2. Pages and controls created or updated

| Item | Status |
|------|--------|
| Privacy Policy | Link to Shopify native `/policies/privacy-policy` — **Admin copy required** |
| Terms of Service / Terms of Sale | Link to `/policies/terms-of-service` — **Admin copy required** |
| Cookie Policy | Template `page.cookie-policy` — incomplete until filled |
| Shipping & Delivery | Template `page.shipping-and-delivery` — incomplete until filled |
| Returns, Refunds & Exchanges | Template `page.returns-refunds-exchanges` — incomplete until filled |
| Warranty | Template `page.warranty` — incomplete until filled |
| Contact & Business Information | Template `page.contact` — incomplete until filled |
| Product Safety & Care | Template `page.product-safety-and-care` — incomplete until filled |
| Your Privacy Choices | Template `page.privacy-choices` — incomplete until filled |
| Accessibility | Template `page.accessibility` — incomplete until filled |
| Cookie banner / preferences | Theme UI + `privacy-controls.js` |
| Footer seller identification | Shows only when Theme settings are filled |

## 3. Implementation / test status

| Area | Status |
|------|--------|
| Theme markup / templates | Implemented |
| Preview footer + cookie UI | Implemented in static preview |
| Shopify Customer Privacy API | Integrated when store provides it |
| Live tracking block before consent | Depends on Shopify Privacy settings + installed pixels/apps |
| Contact form delivery | **Not verified** — needs monitored destination |
| Privacy-request workflow | **Not verified** |
| Checkout legal checkboxes / marketing consent | Native Shopify checkout — configure in Admin; theme cannot fully customize Checkout Extensibility without store access |
| Empty legal pages publish-safe | Yes — show incomplete banners, not fake policies |

## 4. Missing business / product information (launch blockers)

Provide verified values; do not invent:

1. Legal business name and trading name.
2. Business country and contact / registered address.
3. Registration and tax details where disclosure is required.
4. Countries and regions served.
5. Support email / phone and privacy contact.
6. Actual shipping rates, processing times, transit estimates.
7. Actual returns, cancellation, refund, exchange terms.
8. Commercial warranty terms (and confirmation they do not replace statutory rights).
9. Manufacturer / importer / responsible-person details as applicable.
10. Product manuals, safety warnings, package contents, battery/charger inclusion.
11. Verified runtime / charging / care specs (with test conditions).
12. Actual analytics, ads, chat, email/SMS tools and data processors.
13. Data retention and international-transfer practices.
14. Whether subscriptions, gift cards, loyalty, or promos exist.
15. Accessibility help contact route.

## 5. Jurisdiction issues requiring qualified legal review

- Consumer cancellation / withdrawal rights and forms.
- Statutory guarantees and defective-product rights.
- Online product-safety / manufacturer-importer disclosures.
- Battery / electrical product disposal and producer responsibility.
- Regional privacy notices, sale/share opt-outs, and GPC handling.
- Marketing consent and unsubscribe rules.
- Accessibility obligations for target markets.
- Any recurring-payment or promotional terms.

## 6. Remaining launch blockers

- Do **not** publish incomplete policy pages as if they were finished.
- Fill Shopify Admin **Policies** and create the listed **Pages**, assign templates, and paste verified copy.
- Configure Shopify **Customer Privacy** / consent regions and connect real pixels only after categories match the Cookie Policy.
- Set Theme settings: legal name, address, support/privacy emails.
- Populate product metafields (`package_contents`, `battery_included`, `tested_runtime`, etc.).
- Confirm contact and privacy-request delivery to monitored inboxes.
- Legal review of destination-market obligations before claiming compliance.

**This theme update does not make the store “fully compliant.”**
