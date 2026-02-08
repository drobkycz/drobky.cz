# drobky.cz (Astro + Tailwind)

Statický Astro web připravený pro Cloudflare Pages deployment.

## Lokální spuštění

1. Nainstaluj Node.js 20.
2. Nainstaluj závislosti:
   ```bash
   npm install
   ```
3. Spusť dev server:
   ```bash
   npm run dev
   ```
4. Produkční build:
   ```bash
   npm run build
   ```

## Deploy na Cloudflare Pages

Nastav v Cloudflare Pages:

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `20`

Projekt používá statický Astro výstup (`output: static`), tedy bez serverových endpointů.

## Instagram API cache

Cache feedu je v souboru `src/data/instagram.json`.

Lokální refresh:

```bash
INSTAGRAM_ACCESS_TOKEN=... npm run fetch:instagram
```

Pokud proměnné chybí, skript nespadne a zachová existující cache.
`INSTAGRAM_USER_ID` je volitelný (když chybí, používá se endpoint `/me/media`).

### GitHub Actions cron

Workflow je v `/.github/workflows/instagram-cache.yml` a běží každých 6 hodin.

Nastav v repozitáři secrets:

- `INSTAGRAM_ACCESS_TOKEN`
- `INSTAGRAM_USER_ID` (volitelné)

## Admin (Decap CMS)

Admin je dostupný na `/admin`.

Konfigurace je v `public/admin/config.yml`:

- články se ukládají do `src/content/posts/*.md`
- media upload jde do `public/uploads`
- pro lokální práci je zapnuté `local_backend: true`

Důležité:

- v `public/admin/config.yml` změň `backend.repo` z `OWNER/REPO` na skutečný GitHub repozitář
- přihlášení/autorizaci pro produkci doplníme v dalším kroku
