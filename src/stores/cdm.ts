import { defineStore } from 'pinia';
import { computed } from 'vue';
import cdmData from '@/data/cdm.json';
import rawSchemas from '@/data/raw-schemas.json';
import type { Cdm, Entity, RawSchemas } from '@/types';

const cdm = cdmData as unknown as Cdm;
const raw = rawSchemas as unknown as RawSchemas;

export const useCdmStore = defineStore('cdm', () => {
  const meta = computed(() => ({
    version: cdm.version,
    title: cdm.title,
    sourceUrl: cdm.sourceUrl,
    fetchedAt: cdm.fetchedAt,
  }));

  const entities = computed<Entity[]>(() =>
    Object.values(cdm.entities).sort((a, b) => a.name.localeCompare(b.name)),
  );

  const byName = computed<Record<string, Entity>>(() => cdm.entities);

  const entityCount = computed(() => entities.value.length);

  const relationshipCount = computed(() =>
    entities.value.reduce((sum, e) => sum + e.relationships.length, 0),
  );

  const propertyCount = computed(() =>
    entities.value.reduce((sum, e) => sum + e.properties.length, 0),
  );

  function getRawYaml(name: string): string | undefined {
    return raw[name];
  }

  // Reverse-relationship index: which entities point AT a given entity?
  const inboundByTarget = computed<Record<string, { from: string; name: string; cardinality: 'one' | 'many' }[]>>(() => {
    const out: Record<string, { from: string; name: string; cardinality: 'one' | 'many' }[]> = {};
    for (const e of entities.value) {
      for (const r of e.relationships) {
        if (!out[r.target]) out[r.target] = [];
        out[r.target].push({ from: e.name, name: r.name, cardinality: r.cardinality });
      }
    }
    for (const key of Object.keys(out)) {
      out[key].sort((a, b) => a.from.localeCompare(b.from));
    }
    return out;
  });

  return {
    meta,
    entities,
    byName,
    entityCount,
    relationshipCount,
    propertyCount,
    inboundByTarget,
    getRawYaml,
  };
});
