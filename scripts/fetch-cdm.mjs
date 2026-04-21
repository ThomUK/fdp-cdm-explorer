#!/usr/bin/env node
/**
 * Downloads the NHSE FDP Canonical Data Model OpenAPI YAML, extracts the
 * core entities (properties + relationships), and writes trimmed JSON into
 * src/data/ for consumption by the Vue app.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../src/data');

const SOURCE_URL =
  'https://raw.githubusercontent.com/nhsengland/fdp-canonical-data-model/main/canonical-data-model-openapi.yaml';

const META_KEYS = new Set(['__apiName', '__primaryKey', '__rid']);

async function main() {
  console.log(`Fetching ${SOURCE_URL}...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching CDM YAML`);
  const yamlText = await res.text();
  console.log(`  downloaded ${(yamlText.length / 1024 / 1024).toFixed(2)} MB`);

  const doc = yaml.load(yamlText);
  const schemas = doc?.components?.schemas ?? {};
  const paths = doc?.paths ?? {};

  const entityAllowlist = collectEntityNames(paths);
  const entities = extractEntities(schemas, entityAllowlist);
  attachRelationships(entities, paths, schemas);

  const rawSchemas = extractRawSnippets(yamlText, Object.keys(entities));

  const cdm = {
    version: doc?.info?.version ?? 'unknown',
    title: doc?.info?.title ?? 'NHS FDP Canonical Data Model',
    sourceUrl: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    entities,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(resolve(OUT_DIR, 'cdm.json'), JSON.stringify(cdm, null, 2));
  await writeFile(
    resolve(OUT_DIR, 'raw-schemas.json'),
    JSON.stringify(rawSchemas, null, 2),
  );

  const count = Object.keys(entities).length;
  const relCount = Object.values(entities).reduce(
    (sum, e) => sum + e.relationships.length,
    0,
  );
  console.log(`Wrote ${count} entities with ${relCount} relationships.`);
  console.log(`  -> ${resolve(OUT_DIR, 'cdm.json')}`);
  console.log(`  -> ${resolve(OUT_DIR, 'raw-schemas.json')}`);
}

function collectEntityNames(paths) {
  // Real entities are the ones Palantir Foundry exposes as object types at
  // /api/v2/ontologies/<ontology>/objects/<Entity>/... Every other Osdk.<X>
  // schema (List*Response pagination wrappers, Search*Response, etc.) is
  // API plumbing we don't want to browse as an entity.
  // One upstream quirk: `mdtMeeting` uses camelCase in paths while every
  // other entity uses PascalCase — normalise the first letter.
  const re = /^\/api\/v2\/ontologies\/[^/]+\/objects\/([A-Za-z][A-Za-z0-9]+)/;
  const names = new Set();
  for (const path of Object.keys(paths)) {
    const m = path.match(re);
    if (!m) continue;
    const raw = m[1];
    names.add(raw[0].toUpperCase() + raw.slice(1));
  }
  return names;
}

function extractEntities(schemas, allowlist) {
  const entities = {};
  for (const [key, schema] of Object.entries(schemas)) {
    const m = key.match(/^Osdk\.([A-Z][A-Za-z0-9]+)$/);
    if (!m) continue;
    if (!schema || schema.type !== 'object' || !schema.properties) continue;

    const name = m[1];
    if (!allowlist.has(name)) continue;
    const required = new Set(schema.required ?? []);
    const metaProperties = [];
    const properties = [];

    for (const [propName, propDef] of Object.entries(schema.properties)) {
      const p = readProperty(propName, propDef, required.has(propName));
      if (META_KEYS.has(propName)) metaProperties.push(p);
      else properties.push(p);
    }

    properties.sort((a, b) => a.name.localeCompare(b.name));

    entities[name] = {
      name,
      description: schema.description ?? undefined,
      metaProperties,
      properties,
      relationships: [],
    };
  }
  return entities;
}

function readProperty(name, def, required) {
  const prop = {
    name,
    type: def?.type ?? 'unknown',
    required,
  };
  if (def?.format) prop.format = def.format;
  if (def?.description) prop.description = def.description.trim();
  if (def?.nullable) prop.nullable = true;
  if (def?.enum) prop.enum = def.enum;
  if (def?.type === 'array' && def.items) {
    prop.itemType = def.items.type ?? '$ref';
    if (def.items.$ref) prop.itemRef = def.items.$ref;
  }
  if (def?.$ref) prop.ref = def.$ref;
  return prop;
}

function attachRelationships(entities, paths, schemas) {
  // We only consider the "list" form of each link (no {linkedObjectPrimaryKey})
  // because the single-object form is just a re-expression of the same link.
  // Matches the "list" form of a link; case-insensitive first letter to cope
  // with the upstream `mdtMeeting` camelCase oddity.
  const LINK_RE =
    /^\/api\/v2\/ontologies\/[^/]+\/objects\/([A-Za-z][A-Za-z0-9]+)\/\{primaryKey\}\/links\/([a-zA-Z][a-zA-Z0-9]*)$/;

  for (const [pathKey, pathValue] of Object.entries(paths)) {
    const m = pathKey.match(LINK_RE);
    if (!m) continue;
    const [, rawEntity, link] = m;
    const entity = rawEntity[0].toUpperCase() + rawEntity.slice(1);
    if (!entities[entity]) continue;

    const get = pathValue?.get;
    if (!get) continue;

    const target = resolveTargetEntity(get, schemas);
    const cardinality = inferCardinality(link);

    entities[entity].relationships.push({
      name: link,
      target: target ?? 'unknown',
      cardinality,
    });
  }

  for (const entity of Object.values(entities)) {
    entity.relationships.sort((a, b) => a.name.localeCompare(b.name));
  }
}

// Cardinality isn't encoded in the paths or response schemas — both sides of
// every link expose identical "list" + "single" endpoints that return the same
// `List<X>Response` wrapper. The only reliable signal is the link name, which
// follows English plural conventions (e.g. `patient` vs `wardStays`).
function inferCardinality(linkName) {
  return /s$/.test(linkName) ? 'many' : 'one';
}

function resolveTargetEntity(operation, schemas) {
  const schema =
    operation?.responses?.['200']?.content?.['application/json']?.schema;
  if (!schema) return null;

  const refName = readRefName(schema);
  if (refName) return mapSchemaToEntity(refName, schemas);

  // Paged list shape: check `properties.data.items.$ref`
  const items = schema?.properties?.data?.items;
  if (items) {
    const itemRef = readRefName(items);
    if (itemRef) return mapSchemaToEntity(itemRef, schemas);
  }

  return null;
}

function readRefName(node) {
  if (!node) return null;
  if (typeof node.$ref === 'string') {
    const parts = node.$ref.split('/');
    return parts[parts.length - 1];
  }
  if (Array.isArray(node.allOf)) {
    for (const sub of node.allOf) {
      const r = readRefName(sub);
      if (r) return r;
    }
  }
  return null;
}

function mapSchemaToEntity(schemaName, schemas) {
  // Direct Osdk.<Entity> reference.
  const direct = schemaName.match(/^Osdk\.([A-Z][A-Za-z0-9]+)$/);
  if (direct && !/Response$/.test(direct[1])) return direct[1];

  // List wrapper: Osdk.List<Entity>Response → <Entity>
  const list = schemaName.match(/^Osdk\.List([A-Z][A-Za-z0-9]+)Response$/);
  if (list) return list[1];

  // Generic: look for a referenced Osdk.<Entity> inside the wrapper.
  const resolved = schemas[schemaName];
  if (resolved) {
    const nested =
      resolved?.properties?.data?.items ??
      resolved?.properties?.data ??
      resolved;
    const nestedRef = readRefName(nested);
    if (nestedRef) {
      const inner = nestedRef.match(/^Osdk\.([A-Z][A-Za-z0-9]+)$/);
      if (inner && !/Response$/.test(inner[1])) return inner[1];
    }
  }

  return schemaName;
}

function extractRawSnippets(yamlText, entityNames) {
  const lines = yamlText.split('\n');
  const result = {};
  const targets = new Set(entityNames.map((n) => `    Osdk.${n}:`));

  let current = null;
  let start = -1;

  const flush = (endLine) => {
    if (!current) return;
    const snippet = lines.slice(start, endLine).join('\n');
    result[current] = snippet;
    current = null;
    start = -1;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (targets.has(line)) {
      flush(i);
      const name = line.trim().replace(/^Osdk\./, '').replace(/:$/, '');
      current = name;
      start = i;
      continue;
    }
    // Top-level-ish schema boundary: four-space indent, ends with `:`, not inside a list.
    if (current && /^    [A-Za-z][A-Za-z0-9.]*:\s*$/.test(line)) {
      flush(i);
    }
  }
  flush(lines.length);

  return result;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
