export interface Property {
  name: string;
  type: string;
  required?: boolean;
  format?: string;
  description?: string;
  nullable?: boolean;
  itemType?: string;
  itemRef?: string;
  ref?: string;
  enum?: string[];
}

export interface Relationship {
  name: string;
  target: string;
  cardinality: 'one' | 'many';
}

export interface Entity {
  name: string;
  description?: string;
  metaProperties: Property[];
  properties: Property[];
  relationships: Relationship[];
}

export interface Cdm {
  version: string;
  title: string;
  sourceUrl: string;
  fetchedAt: string;
  entities: Record<string, Entity>;
}

export type RawSchemas = Record<string, string>;
