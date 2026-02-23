import { buildFilterBy, buildFilterByExcluding } from './facets';
import { getPaginationInfo } from './pagination';
import { sortToTypesense } from './sorting';
import {
  getHitTemplates,
  renderHit,
  renderStats,
  renderNoResults,
  renderFacetPanel,
  renderFacetItem,
  renderPaginationItem,
} from './template-engine';
import { search } from './typesense-client';
import { getUrlState, updateUrlState } from './url-state';

const config = window.municipioSearchConfig;
if (!config) {
  console.warn('Municipio Search: config not found');
} else {
  init();
}

function init(): void {
  const container = document.querySelector('[data-js-search-page-container]');
  if (!container) return;

  const searchInput = container.querySelector<HTMLInputElement>('[data-js-search-page-search-input]');
  const hitsEl = container.querySelector('[data-js-search-page-hits]');
  const statsEl = container.querySelector('[data-js-search-page-stats], #municipio-search__stats');
  const facetsEl = container.querySelector('[data-js-search-page-facets]');
  const paginationEl = container.querySelector('[data-js-search-page-pagination]');
  const sortSelect = container.querySelector<HTMLSelectElement>('[data-js-search-page-sort-select]');

  const hitTemplates = getHitTemplates();
  if (hitTemplates.size === 0) return;

  function syncInputs(): void {
    const state = getUrlState();
    if (searchInput) searchInput.value = state.query;
    if (sortSelect) sortSelect.value = state.sort;
  }

  function runSearch(): void {
    const state = getUrlState();
    const typesenseQuery = state.query.trim() || '*';
    const filterBy = buildFilterBy(state.facetFilters);
    const sortBy = sortToTypesense(state.sort);

    const mainParams = {
      q: typesenseQuery,
      query_by: config.search.queryBy,
      per_page: config.search.perPage,
      page: state.page,
      ...(sortBy && { sort_by: sortBy }),
      ...(filterBy && { filter_by: filterBy }),
      ...(config.search.highlightFields && { highlight_fields: config.search.highlightFields }),
      ...(config.facets?.length && {
        facet_by: config.facets.map((f) => f.attribute).join(','),
        max_facet_values: 25,
      }),
    };

    const activeFacetAttrs = config.facets
      ? config.facets
          .filter((f) => (state.facetFilters[f.attribute]?.length ?? 0) > 0)
          .map((f) => f.attribute)
      : [];

    hitsEl?.classList.add('is-loading');

    const disjunctivePromises = activeFacetAttrs.map((attr) => {
      const filterByExcluding = buildFilterByExcluding(state.facetFilters, attr);
      return search({
        q: typesenseQuery,
        query_by: config.search.queryBy,
        per_page: 0,
        page: 1,
        ...(sortBy && { sort_by: sortBy }),
        ...(filterByExcluding && { filter_by: filterByExcluding }),
        facet_by: attr,
        max_facet_values: 25,
      });
    });

    Promise.all([search(mainParams), ...disjunctivePromises])
      .then(([mainRes, ...disjunctiveResults]) => {
        hitsEl?.classList.remove('is-loading');

        let facetCounts = (mainRes.facet_counts ?? []).filter(Boolean);
        if (activeFacetAttrs.length > 0 && disjunctiveResults.length > 0) {
          const disjunctiveByAttr = new Map<string, typeof facetCounts[0]>();
          activeFacetAttrs.forEach((attr, i) => {
            const found = disjunctiveResults[i]?.facet_counts?.find((f) => f.field_name === attr);
            if (found) disjunctiveByAttr.set(attr, found);
          });
          facetCounts = facetCounts.map((fc) => {
            if (!fc) return fc;
            return disjunctiveByAttr.get(fc.field_name) ?? fc;
          }).filter(Boolean);
        }

        if (hitsEl) renderHits(mainRes.hits, hitTemplates, hitsEl);
        if (statsEl) renderStatsResult(mainRes.found, statsEl);
        if (facetsEl && config.facets?.length) {
          renderFacets(facetCounts, state.facetFilters, facetsEl);
          updateFacetNotice(facetsEl, facetCounts);
        }
        if (paginationEl) renderPagination(mainRes.found, paginationEl);
      })
      .catch((err) => {
        hitsEl?.classList.remove('is-loading');
        console.error('Municipio Search:', err);
        if (hitsEl) hitsEl.innerHTML = `<p class="municipio-search__error">${config.translations?.noresults ?? 'Search failed.'}</p>`;
      });
  }

  function renderHits(
    hits: Array<{ document: Record<string, unknown>; highlight?: Record<string, { snippet?: string }> }>,
    templates: Map<string, string>,
    el: Element
  ): void {
    if (hits.length === 0) {
      el.innerHTML = renderNoResults() || (config.translations?.noresults ?? 'No results found.');
      return;
    }
    el.innerHTML = hits.map((h) => renderHit(h, templates)).join('');
  }

  function renderStatsResult(count: number, el: Element): void {
    el.innerHTML = renderStats(count);
  }

  function updateFacetNotice(
    facetsContainer: Element,
    facetCounts: Array<{ field_name: string; counts: Array<{ value: string; count: number }> }>
  ): void {
    const noticeEl = facetsContainer.parentElement?.querySelector<HTMLElement>(
      '[data-js-search-page-facet-notice]'
    );
    if (!noticeEl) return;
    const hasFacetsToShow = facetCounts.some((fc) => fc && Array.isArray(fc.counts) && fc.counts.length > 0);
    noticeEl.hidden = hasFacetsToShow;
    noticeEl.setAttribute('aria-hidden', String(hasFacetsToShow));
  }

  function renderFacets(
    facetCounts: Array<{ field_name: string; counts: Array<{ value: string; count: number }> }>,
    currentFilters: Record<string, string[]>,
    el: Element
  ): void {
    const labels: Record<string, string> = {};
    config.facets?.forEach((f) => {
      labels[f.attribute] = f.label;
    });

    let html = '';
    facetCounts.forEach((fc) => {
      if (!fc || !Array.isArray(fc.counts)) return;
      const label = labels[fc.field_name] ?? fc.field_name;
      const selected = currentFilters[fc.field_name] ?? [];
      const itemsHtml = fc.counts
        .map((c) => renderFacetItem(fc.field_name, c.value, c.count, selected.includes(c.value)))
        .join('');
      html += renderFacetPanel(label, itemsHtml);
    });
    el.innerHTML = html || '';

    el.querySelectorAll('[data-js-facet-filter]').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const attr = (checkbox as HTMLElement).getAttribute('data-facet-attribute');
        const value = (checkbox as HTMLInputElement).value;
        const checked = (checkbox as HTMLInputElement).checked;
        if (!attr || typeof value !== 'string') return;

        const freshState = getUrlState();
        const currentValues = freshState.facetFilters[attr] ?? [];
        const newValues = checked
          ? [...currentValues.filter((v) => v !== value), value]
          : currentValues.filter((v) => v !== value);

        const newFilters = { ...freshState.facetFilters, [attr]: newValues };
        updateUrlState({ facetFilters: newFilters, page: 1 });
        runSearch();
      });
    });
  }

  function renderPagination(totalHits: number, el: Element): void {
    const state = getUrlState();
    const info = getPaginationInfo(state.page, totalHits, config.search.perPage);
    if (info.totalPages <= 1) {
      el.innerHTML = '';
      return;
    }

    const params = new URLSearchParams();
    if (state.query) params.set('s', state.query);
    Object.entries(state.facetFilters).forEach(([attr, values]) => {
      if (Array.isArray(values)) {
        values.forEach((v) => params.append(`facet_${attr}`, v));
      }
    });
    if (state.sort && state.sort !== 'relevance') params.set('sort', state.sort);
    const baseParams = params.toString();
    const baseUrl = `${window.location.pathname}${baseParams ? '?' + baseParams : ''}`;
    const pageUrl = (p: number) => (p === 1 ? baseUrl : `${baseUrl}${baseParams ? '&' : '?'}page=${p}`);

    let html = '';
    const page = info.currentPage;
    if (info.hasPrev) {
      html += renderPaginationItem(1, '«', pageUrl(1), false);
      html += renderPaginationItem(page - 1, '‹', pageUrl(page - 1), false);
    }
    info.pages.forEach((p) => {
      html += renderPaginationItem(p.page, p.label, pageUrl(p.page), p.isCurrent);
    });
    if (info.hasNext) {
      html += renderPaginationItem(page + 1, '›', pageUrl(page + 1), false);
      html += renderPaginationItem(info.totalPages, '»', pageUrl(info.totalPages), false);
    }

    el.innerHTML = `<ul class="c-pagination u-margin__top--4">${html}</ul>`;

    el.querySelectorAll('.c-pagination__link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const val = (link as HTMLElement).getAttribute('data-value');
        if (val) {
          updateUrlState({ page: parseInt(val, 10) });
          runSearch();
        }
      });
    });
  }

  syncInputs();
  runSearch();

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      updateUrlState({ query: searchInput.value, page: 1 });
      runSearch();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      updateUrlState({ sort: sortSelect.value, page: 1 });
      runSearch();
    });
  }
}
