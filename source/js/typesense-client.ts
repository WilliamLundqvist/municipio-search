declare global {
  interface Window {
    municipioSearchConfig?: MunicipioSearchConfig;
  }
}

export interface MunicipioSearchConfig {
  typesense: {
    host: string;
    port: number;
    protocol: string;
    apiKey: string;
    collection: string;
  };
  search: {
    query: string;
    queryBy: string;
    perPage: number;
    page: number;
    highlightFields?: string;
  };
  facets: Array<{ attribute: string; label: string; enabled?: boolean }>;
  translations: Record<string, string>;
  hitTemplateTypes: string[];
  /** Map of post_type -> template key for custom hit templates (e.g. { sv_lov: 'simpleview', municipal_event: 'calendar' }) */
  customTemplateTypes?: Record<string, string>;
  /** Map of post_type_name (display label) -> template key when document uses post_type_name instead of post_type */
  customTemplateTypesByPostTypeName?: Record<string, string>;
}

/** Typesense highlight format: each field has snippet (HTML with <mark>) and matched_tokens */
export interface TypesenseHighlightField {
  snippet?: string;
  matched_tokens?: string[];
}

export interface TypesenseHit {
  document: Record<string, unknown>;
  highlight?: Record<string, TypesenseHighlightField>;
  text_match?: number;
}

export interface TypesenseFacetCount {
  value: string;
  count: number;
}

export interface TypesenseFacet {
  counts: TypesenseFacetCount[];
  field_name: string;
  stats?: { total_values: number };
}

export interface TypesenseResponse {
  found: number;
  out_of: number;
  page: number;
  request_params: { q: string };
  search_time_ms: number;
  facet_counts?: TypesenseFacet[];
  hits: TypesenseHit[];
}

export interface SearchParams {
  q: string;
  query_by: string;
  per_page: number;
  page: number;
  sort_by?: string;
  filter_by?: string;
  facet_by?: string;
  highlight_fields?: string;
  max_facet_values?: number;
}

function getBaseUrl(config: MunicipioSearchConfig['typesense']): string {
  const port = config.port === 443 || config.port === 80 ? '' : `:${config.port}`;
  return `${config.protocol}://${config.host}${port}`;
}

export async function search(
  params: SearchParams
): Promise<TypesenseResponse> {
  const config = window.municipioSearchConfig;
  if (!config?.typesense?.apiKey || !config.typesense.collection) {
    throw new Error('Municipio Search: Typesense not configured');
  }

  const baseUrl = getBaseUrl(config.typesense);
  const path = `/collections/${config.typesense.collection}/documents/search`;
  const url = new URL(path, baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-TYPESENSE-API-KEY': config.typesense.apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Typesense search failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<TypesenseResponse>;
}
