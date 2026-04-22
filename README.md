# FDP CDM Explorer

**Live site:** https://thomuk.github.io/fdp-cdm-explorer/

A friendly browser for the NHS England Federated Data Platform [Canonical Data Model](https://github.com/nhsengland/fdp-canonical-data-model). Instead of scrolling through a 100,000-line OpenAPI YAML, you get an entity list, detail pages, fuzzy search, and an interactive relationship graph.

## What you can do

- **Browse the 80 entities** — Patient, Admission, Appointment, WardStay, CancerPathway, and so on — grouped alphabetically on the home page.
- **Open an entity page** to see its properties (name, type, format, description), its outbound relationships, the inbound relationships from other entities, and the raw OpenAPI snippet.
- **Follow a relationship** by clicking the target entity to jump to its page.
- **Search with `⌘K` / `Ctrl K`** across entity names, property names and descriptions, and relationships.
- **Open the graph view** to see every entity as a node and every relationship as an edge. Links are colour-coded and labelled with cardinality (1:1 or 1:N). Double-click a node to jump to its entity page; use the "Focus" dropdown to pin a single entity and show only its direct neighbours.
- **Jump to the source** — every entity page has a collapsible panel with its original YAML, and the home page links out to both the upstream repo and the companion `data-spec.pdf`.

## Reading an entity page

- The **Properties** table lists every field defined on the entity. NHS Data Dictionary URLs in descriptions are auto-linked. There's a filter box to narrow the list by name, type, or description text.
- **Outbound relationships** are links the entity owns (e.g. `Admission → patient` is 1:1, `Admission → wardStays` is 1:N).
- **Inbound relationships** are the reverse — which other entities point at this one, and by what link name.
- **Meta** shows the Palantir Foundry bookkeeping fields (`__apiName`, `__primaryKey`, `__rid`).
- **Raw OpenAPI YAML** is the verbatim snippet from upstream, with a copy button.

## Where the data comes from

The underlying model is NHS England's [`fdp-canonical-data-model`](https://github.com/nhsengland/fdp-canonical-data-model), published under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). NHSE updates the upstream YAML monthly; a scheduled GitHub Action in this repo re-runs the extraction on the 1st of each month and opens a PR with the changes, so the site stays in sync without manual work.

The explorer is read-only — it's a reference for the data model, not a client for the live Palantir Foundry API.

## Run it locally

Requires Node 22+ and pnpm.

```bash
pnpm install
pnpm fetch-cdm    # refresh src/data/ from upstream (optional; a snapshot is committed)
pnpm dev          # open http://localhost:5173
```

To produce the static bundle:

```bash
pnpm build
pnpm preview
```

## Deployment

Pushes to `main` build and deploy to GitHub Pages via `.github/workflows/deploy.yml`. In the repo settings, **Pages → Source** must be set to **"GitHub Actions"**.

## Licence

The extracted data in `src/data/` is derived from NHS England's Canonical Data Model and is licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
