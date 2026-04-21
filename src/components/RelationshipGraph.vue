<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { DataSet } from 'vis-data';
import { Network, type Edge, type Node, type Options } from 'vis-network';
import { useCdmStore } from '@/stores/cdm';

const props = defineProps<{ focus?: string }>();

const store = useCdmStore();
const router = useRouter();

const container = ref<HTMLDivElement | null>(null);
let network: Network | null = null;

function build(focus?: string) {
  if (!container.value) return;

  const entities = store.entities;
  const byName = store.byName;

  const relCount: Record<string, number> = {};
  for (const e of entities) {
    relCount[e.name] = e.relationships.length + (store.inboundByTarget[e.name]?.length ?? 0);
  }

  const visibleNames = new Set<string>(entities.map((e) => e.name));
  if (focus && byName[focus]) {
    visibleNames.clear();
    visibleNames.add(focus);
    for (const r of byName[focus].relationships) visibleNames.add(r.target);
    for (const r of store.inboundByTarget[focus] ?? []) visibleNames.add(r.from);
  }

  const nodes = new DataSet<Node>(
    entities
      .filter((e) => visibleNames.has(e.name))
      .map((e) => {
        const count = relCount[e.name] ?? 0;
        return {
          id: e.name,
          label: e.name,
          value: Math.max(count, 1),
          shape: 'dot',
          color: e.name === focus
            ? { background: '#ffd166', border: '#a36d00', highlight: { background: '#ffd166', border: '#a36d00' } }
            : { background: '#cfe3f5', border: '#005eb8', highlight: { background: '#a6cdeb', border: '#004280' } },
          font: { size: 14, color: '#0f172a' },
        };
      }),
  );

  const edgeSet = new Map<string, Edge>();
  for (const e of entities) {
    if (!visibleNames.has(e.name)) continue;
    for (const r of e.relationships) {
      if (!byName[r.target]) continue;
      if (!visibleNames.has(r.target)) continue;
      const key = `${e.name}->${r.target}::${r.name}`;
      if (edgeSet.has(key)) continue;
      const cardLabel = r.cardinality === 'many' ? '1:N' : '1:1';
      edgeSet.set(key, {
        id: key,
        from: e.name,
        to: r.target,
        arrows: 'to',
        label: `${r.name}\n${cardLabel}`,
        font: { size: 10, color: '#64748b', align: 'top', multi: false },
        color: { color: r.cardinality === 'many' ? '#10b981' : '#0ea5e9', opacity: 0.6 },
        smooth: { enabled: true, type: 'dynamic', roundness: 0.3 },
      });
    }
  }
  const edges = new DataSet<Edge>(Array.from(edgeSet.values()));

  const options: Options = {
    autoResize: true,
    height: '100%',
    width: '100%',
    physics: {
      enabled: true,
      solver: 'forceAtlas2Based',
      forceAtlas2Based: { gravitationalConstant: -60, springLength: 150, avoidOverlap: 0.6 },
      stabilization: { iterations: 200, fit: true },
    },
    interaction: { hover: true, tooltipDelay: 200, navigationButtons: true, keyboard: true },
    nodes: { scaling: { min: 8, max: 40, label: { enabled: true, min: 12, max: 20 } } },
    edges: { width: 1, selectionWidth: 2 },
  };

  if (network) network.destroy();
  network = new Network(container.value, { nodes, edges }, options);
  network.on('doubleClick', (params: { nodes: string[] }) => {
    const id = params.nodes?.[0];
    if (id) router.push({ name: 'entity', params: { name: id } });
  });
}

onMounted(() => build(props.focus));
watch(() => props.focus, (f) => build(f));
onBeforeUnmount(() => {
  if (network) {
    network.destroy();
    network = null;
  }
});
</script>

<template>
  <div ref="container" class="w-full h-full bg-white" />
</template>
