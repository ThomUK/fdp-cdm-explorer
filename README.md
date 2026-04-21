# FDP CDM Explorer

A static Vue 3 app for browsing the NHS England Federated Data Platform [Canonical Data Model](https://github.com/nhsengland/fdp-canonical-data-model).

Entities, properties, relationships, fuzzy search, and an interactive relationship graph — all served as a static bundle from GitHub Pages.

## Develop

```bash
pnpm install
pnpm fetch-cdm   # download + parse the upstream OpenAPI YAML into src/data/
pnpm dev
```

Open http://localhost:5173.

## Build

```bash
pnpm build
pnpm preview
```

## How it works

`scripts/fetch-cdm.mjs` downloads the ~3MB OpenAPI YAML from `nhsengland/fdp-canonical-data-model`, walks `components.schemas` and `paths`, and writes a trimmed `src/data/cdm.json` plus a `src/data/raw-schemas.json` of per-entity YAML snippets. The browser ships with that static data — no runtime YAML parsing.

A scheduled GitHub Action re-runs the fetch on the 1st of each month and opens a PR when the upstream model has changed.

## Deployment

Pushes to `main` deploy to GitHub Pages via `.github/workflows/deploy.yml`. Enable Pages in the repository settings with "GitHub Actions" as the source.
