# salamanca-bus-web

Static site for the Salamanca Bus Android app (app repo: GitLab `salamanca-bus/salamanca-bus`, spec in its `docs/app-spec.md`). Jekyll 4, built by GitHub Actions, served by GitHub Pages at https://salamancabus.davidjuanes.dev/ behind Cloudflare. Push straight to `main`; every push deploys.

- **i18n without plugins.** Spanish at `/`, English at `/en/`. Landing texts live in `_data/i18n/{es,en}.yml` and are rendered by `_includes/landing.html`; each page sets `lang` and a shared `ref` so the layout can find its translation (language switch, `hreflang`). Change both languages together. No automatic redirect by browser language.
- **Privacy policy** (`privacidad.md`, `en/privacy.md`) is the URL declared in Play Console. It must match the app's Data safety form (described in the app repo's `docs/play-listing.md`): when the app starts or stops collecting something, update both policies and their `updated` date.
- **`app-ads.txt`** holds the AdMob publisher line (`pub-0847996848911499`). AdMob crawls it from the developer website set in the Play listing.
- **Images** in `assets/img` come from the app repo: phone screens from the Roborazzi snapshots (`app/src/test/screenshots`; the English ones are recorded with the `en-rGB` qualifier, and `nearby-dark-clock` with `ArrivalFormat.CLOCK`), the stop photo from `assets/streetview/222.webp`, the map and the gallery from the Play listing graphics. Converted to WebP with ImageMagick.
- **No third parties at runtime:** fonts are self-hosted (latin subset, OFL), no analytics, no cookies. The privacy policy says so; keep it true.
- **Motion:** native CSS (scroll-driven animations) and vanilla JS in `assets/js/main.js`; everything stops under `prefers-reduced-motion`.
- The Google Play badge is Google's official image; don't edit it, and keep the trademark line in the footer.
