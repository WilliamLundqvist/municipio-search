export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalHits: number;
  perPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  pages: Array<{ page: number; label: string; isCurrent: boolean }>;
}

export function getPaginationInfo(
  page: number,
  totalHits: number,
  perPage: number,
  maxVisible = 5
): PaginationInfo {
  const totalPages = Math.max(1, Math.ceil(totalHits / perPage));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  const pages: PaginationInfo['pages'] = [];
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push({
      page: i,
      label: String(i),
      isCurrent: i === currentPage,
    });
  }

  return {
    currentPage,
    totalPages,
    totalHits,
    perPage,
    hasNext,
    hasPrev,
    pages,
  };
}
