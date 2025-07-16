// API Types matching the Python backend models

export interface Repository {
  url: string;
  source: string;
  id: string;
}

export interface VersionDetail {
  version: string;
  release_date: string;
  is_latest: boolean;
}

export interface Input {
  description?: string;
  is_required?: boolean;
  format?: 'string' | 'number' | 'boolean' | 'file_path';
  value?: string;
  is_secret?: boolean;
  default?: string;
  choices?: string[];
  template?: string;
  properties?: Record<string, Input>;
}

export interface KeyValueInput extends Input {
  name: string;
  variables?: Record<string, Input>;
}

export interface Argument extends Input {
  type: 'positional' | 'named';
  name?: string;
  is_repeated?: boolean;
  value_hint?: string;
  variables?: Record<string, Input>;
}

export interface Package {
  registry_name: string;
  name: string;
  version: string;
  runtime_hint?: string;
  runtime_arguments?: Argument[];
  package_arguments?: Argument[];
  environment_variables?: KeyValueInput[];
}

export interface Remote {
  transport_type: string;
  url: string;
  headers?: Input[];
}

export interface Server {
  id: string;
  name: string;
  description: string;
  repository: Repository;
  version_detail: VersionDetail;
}

export interface ServerDetail extends Server {
  packages?: Package[];
  remotes?: Remote[];
}

export interface PaginationMetadata {
  next_cursor?: string;
  count?: number;
  total?: number;
}

export interface ServerListResponse {
  servers: Server[];
  metadata?: PaginationMetadata;
}

export interface HealthResponse {
  status: string;
  auth_enabled: boolean;
}

// Frontend-specific types

export interface SearchFilters {
  query?: string;
  languages?: string[];
  categories?: string[];
  registries?: string[];
  limit?: number;
  cursor?: string;
}

export interface CategoryInfo {
  name: string;
  color: string;
  count: number;
}

export interface TechnologyInfo {
  name: string;
  color: string;
  icon?: string;
  count: number;
}

// Utility types for UI
export type ServerCardProps = {
  server: Server;
  className?: string;
};