# H.H Traders - 10 Design Demos

Ten complete, working store demos for H.H Traders. Open `index.html` for the combined page, or open any `design-NN/index.html` directly. Everything runs from static files: double-click works, and the same folder deploys as-is to GitHub Pages or any static host (relative paths only).

## Folder structure

- `index.html` - combined landing page linking all 10 demos
- `shared/` - code used by every design (do not copy it per design)
  - `data.js` - all products, categories, prices and store details
  - `base.css` - shared components (picker, drawers, cards, forms, animations)
  - `store.js` - cart, wishlist, search, quick view, filters, checkout, animations
  - `img/` - product and hero photos
- `design-01/` to `design-10/` - one folder per design
  - `theme.css` - that design's fonts, colors and layout
  - `index.html`, `shop.html`, `product.html`, `cart.html`, `checkout.html`, `confirmation.html`, `404.html`

## How to change things

- **Products and prices:** edit `shared/data.js` (name, price, rating, blurb, category). Every design updates at once.
- **Store details (address, phones, brands):** also in `shared/data.js`, plus the footer text in each design's pages.
- **Colors:** each design's accent picker holds 10 curated colors in its pages' theme bar (`data-c` on the swatch buttons). The default palette shades (background, ink, lines) live in `design-NN/theme.css` under `:root`.
- **Fonts:** change the Google Fonts link and the `--font-d` / `--font-b` variables in `design-NN/theme.css`.
- **Logo:** the logo is styled text ("H.H Traders") in each page header. Replace that anchor's text, or swap it for an `<img>` of your logo file placed in the design folder.
- **Photos:** replace files in `shared/img/` keeping the same names, or update the paths in `shared/data.js`.

## Deploy (GitHub Pages)

1. Push this whole folder to a GitHub repository.
2. Repository Settings, then Pages, then set Source to the main branch, root folder.
3. The site appears at `https://<user>.github.io/<repo>/` - the combined page is the root `index.html`.

## Notes

- Carts, wishlists and color choices are stored per design in localStorage (`hh10_dNN_*`), so demos never overwrite each other.
- Checkout is a demo: orders are confirmed locally with an order number, no payment is taken.
