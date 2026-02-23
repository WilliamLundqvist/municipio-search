declare global {
  interface Window {
    municipioSearchSuggestionsConfig?: {
      typesense: { host: string; port: number; protocol: string; apiKey: string; collection: string };
      search: { queryBy: string; perPage: number };
      translations: { noresults: string };
    };
  }
}

const config = window.municipioSearchSuggestionsConfig;
if (!config?.typesense?.apiKey) {
  // Suggestions disabled
} else {
  initSuggestions();
}

function initSuggestions(): void {
  const inputs = document.querySelectorAll<HTMLInputElement>(
    'form.search-form input[name="s"], form.search-form input[type="search"], #header-search-form__field, #hero-search-form__field'
  );

  inputs.forEach((input) => {
    const wrapper = input.closest('form') ?? input.parentElement;
    if (!wrapper || wrapper.querySelector('[data-js-search-suggestions-container]')) return;

    const container = document.createElement('div');
    container.setAttribute('data-js-search-suggestions-container', '');
    container.className = 'municipio-search-suggestions';
    container.hidden = true;
    wrapper.style.position = 'relative';
    wrapper.appendChild(container);

    let debounceTimer: ReturnType<typeof setTimeout>;
    let selectedIndex = -1;

    const onInput = (): void => {
      clearTimeout(debounceTimer);
      const q = input.value.trim();
      if (q.length < 2) {
        container.hidden = true;
        return;
      }
      debounceTimer = setTimeout(() => fetchSuggestions(q, container), 200);
    };

    const onBlur = (): void => {
      setTimeout(() => {
        container.hidden = true;
        selectedIndex = -1;
      }, 150);
    };

    const onKeydown = (e: KeyboardEvent): void => {
      if (container.hidden) return;
      const items = container.querySelectorAll('[data-js-search-suggestion-link]');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        (items[selectedIndex] as HTMLElement)?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        if (selectedIndex >= 0) (items[selectedIndex] as HTMLElement)?.focus();
        else input.focus();
      } else if (e.key === 'Escape') {
        container.hidden = true;
        selectedIndex = -1;
      }
    };

    input.addEventListener('input', onInput);
    input.addEventListener('focus', onInput);
    input.addEventListener('blur', onBlur);
    input.addEventListener('keydown', onKeydown);
  });
}

async function fetchSuggestions(query: string, container: HTMLElement): Promise<void> {
  const cfg = window.municipioSearchSuggestionsConfig;
  if (!cfg) return;

  const baseUrl = `${cfg.typesense.protocol}://${cfg.typesense.host}${cfg.typesense.port === 443 || cfg.typesense.port === 80 ? '' : ':' + cfg.typesense.port}`;
  const url = new URL(
    `/collections/${cfg.typesense.collection}/documents/search`,
    baseUrl
  );
  url.searchParams.set('q', query);
  url.searchParams.set('query_by', cfg.search.queryBy);
  url.searchParams.set('per_page', String(cfg.search.perPage));

  try {
    const res = await fetch(url.toString(), {
      headers: { 'X-TYPESENSE-API-KEY': cfg.typesense.apiKey },
    });
    const data = (await res.json()) as { hits?: Array<{ document: Record<string, unknown> }> };
    const hits = data.hits ?? [];
    const template = document.querySelector<HTMLTemplateElement>('template[data-js-search-suggestion-item]');
    if (!template) return;

    container.innerHTML = '';
    if (hits.length === 0) {
      container.innerHTML = `<div class="municipio-search-suggestions__empty">${cfg.translations?.noresults ?? 'No results'}</div>`;
    } else {
      hits.forEach((hit) => {
        const doc = hit.document;
        const html = (template.innerHTML as string)
          .replace('{SEARCH_SUGGESTION_LINK}', String(doc.permalink ?? '#'))
          .replace('{SEARCH_SUGGESTION_TITLE}', escapeHtml(String(doc.post_title ?? '')))
          .replace('{SEARCH_SUGGESTION_META}', escapeHtml(String(doc.post_type_name ?? doc.post_date_formatted ?? '')));
        const div = document.createElement('div');
        div.innerHTML = html;
        container.appendChild(div.firstElementChild!);
      });
    }
    container.hidden = false;
  } catch {
    container.innerHTML = `<div class="municipio-search-suggestions__error">${cfg?.translations?.noresults ?? 'Error'}</div>`;
    container.hidden = false;
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
