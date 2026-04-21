<script setup lang="ts">
import { computed } from 'vue';
import { useCdmStore } from '@/stores/cdm';
import PropertiesTable from '@/components/PropertiesTable.vue';
import RelationshipsList from '@/components/RelationshipsList.vue';
import RawYamlView from '@/components/RawYamlView.vue';

const props = defineProps<{ name: string }>();
const store = useCdmStore();

const entity = computed(() => store.byName[props.name]);
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-4 py-6">
    <template v-if="entity">
      <header class="mb-6">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <router-link to="/" class="hover:text-slate-700">Entities</router-link>
          <span>/</span>
          <span class="text-slate-700">{{ entity.name }}</span>
        </div>
        <h1 class="mt-1 text-2xl font-bold text-slate-900 font-mono">{{ entity.name }}</h1>
        <p v-if="entity.description" class="mt-2 text-slate-600">{{ entity.description }}</p>

        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span class="px-2 py-1 rounded bg-slate-100 text-slate-600">
            {{ entity.properties.length }} properties
          </span>
          <span class="px-2 py-1 rounded bg-slate-100 text-slate-600">
            {{ entity.relationships.length }} outbound
          </span>
          <span class="px-2 py-1 rounded bg-slate-100 text-slate-600">
            {{ (store.inboundByTarget[entity.name] ?? []).length }} inbound
          </span>
        </div>
      </header>

      <div class="grid gap-8">
        <RelationshipsList :entity-name="entity.name" :relationships="entity.relationships" />

        <PropertiesTable :properties="entity.properties" />

        <section v-if="entity.metaProperties.length">
          <h2 class="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Meta</h2>
          <div class="border border-slate-200 rounded-lg bg-white divide-y divide-slate-100 text-sm">
            <div
              v-for="p in entity.metaProperties"
              :key="p.name"
              class="px-3 py-2 flex items-center gap-3 font-mono text-[13px]"
            >
              <span class="text-slate-900">{{ p.name }}</span>
              <span class="text-slate-500 text-xs">{{ p.type }}</span>
              <span v-if="p.required" class="ml-auto text-[10px] text-rose-600 font-sans">required</span>
            </div>
          </div>
        </section>

        <RawYamlView :entity-name="entity.name" />
      </div>
    </template>

    <div v-else class="py-20 text-center">
      <p class="text-slate-500 mb-4">Unknown entity: <code class="font-mono">{{ name }}</code></p>
      <router-link to="/" class="text-[#005eb8] hover:underline">Back to entities</router-link>
    </div>
  </div>
</template>
