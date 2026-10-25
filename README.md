# salamanca-bus-web

Website of the Salamanca Bus Android app: https://salamancabus.davidjuanes.dev/

- Landing page in Spanish (`/`) and English (`/en/`).
- Privacy policy linked from Google Play: `/privacidad/` and `/en/privacy/`.
- `app-ads.txt` for AdMob.

## Local build

Ruby is pinned in `.tool-versions` (read by mise locally and by `ruby/setup-ruby` in CI).

```sh
mise install
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll serve   # http://127.0.0.1:4000
```

## Deploy

Every push to `main` builds the site with GitHub Actions (`.github/workflows/pages.yml`) and publishes it to GitHub Pages. The custom domain is in `CNAME`; DNS is a Cloudflare CNAME `salamancabus` → `davidjuanes.github.io`.
