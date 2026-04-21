declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}

declare module '@/data/cdm.json' {
  const value: unknown;
  export default value;
}

declare module '@/data/raw-schemas.json' {
  const value: unknown;
  export default value;
}
