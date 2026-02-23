export interface FacetState {
  [attribute: string]: string[];
}

export function buildFilterBy(facetFilters: Record<string, string[]>): string {
  return buildFilterByExcluding(facetFilters);
}

export function buildFilterByExcluding(
  facetFilters: Record<string, string[]>,
  excludeAttr?: string
): string {
  const conditions: string[] = [];
  Object.entries(facetFilters).forEach(([attr, values]) => {
    if (attr === excludeAttr || !Array.isArray(values) || values.length === 0) return;
    if (values.length === 1) {
      conditions.push(`${attr}:=${escapeFilterValue(values[0])}`);
    } else {
      conditions.push(`${attr}:=[${values.map(escapeFilterValue).join(', ')}]`);
    }
  });
  return conditions.join(' && ');
}

function escapeFilterValue(value: string): string {
  if (value.includes(',') || value.includes(']') || value.includes('`')) {
    return '`' + value.replace(/`/g, '``') + '`';
  }
  return value;
}
