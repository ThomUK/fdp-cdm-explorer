import Fuse from 'fuse.js';
import { computed } from 'vue';
import { useCdmStore } from '@/stores/cdm';

export interface SearchHit {
  entity: string;
  kind: 'entity' | 'property' | 'relationship';
  label: string;
  detail?: string;
}

export function useSearch() {
  const store = useCdmStore();

  const documents = computed<SearchHit[]>(() => {
    const hits: SearchHit[] = [];
    for (const e of store.entities) {
      hits.push({ entity: e.name, kind: 'entity', label: e.name, detail: e.description });
      for (const p of e.properties) {
        hits.push({
          entity: e.name,
          kind: 'property',
          label: `${e.name}.${p.name}`,
          detail: p.description ?? p.type,
        });
      }
      for (const r of e.relationships) {
        hits.push({
          entity: e.name,
          kind: 'relationship',
          label: `${e.name} → ${r.target}`,
          detail: `${r.name} (${r.cardinality})`,
        });
      }
    }
    return hits;
  });

  const fuse = computed(
    () =>
      new Fuse(documents.value, {
        keys: [
          { name: 'label', weight: 0.7 },
          { name: 'detail', weight: 0.3 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
  );

  function search(query: string, limit = 50): SearchHit[] {
    const q = query.trim();
    if (!q) return [];
    return fuse.value.search(q, { limit }).map((r) => r.item);
  }

  return { search };
}
