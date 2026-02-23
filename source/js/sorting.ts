export type SortOption = 'relevance' | 'date_desc' | 'date_asc';

export function sortToTypesense(sort: string): string | undefined {
  switch (sort) {
    case 'date_desc':
      return 'post_date:desc';
    case 'date_asc':
      return 'post_date:asc';
    case 'relevance':
    default:
      return undefined;
  }
}
