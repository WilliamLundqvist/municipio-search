import type { TypesenseHit, TypesenseHighlightField } from "./typesense-client";

type PlaceholderResult = string | { value: string; highlighted: true };

const PLACEHOLDERS: Record<
  string,
  (
    doc: Record<string, unknown>,
    highlight?: Record<string, TypesenseHighlightField>,
  ) => PlaceholderResult
> = {
  SEARCH_HIT_HEADING: (d, h) => {
    const snippet = h?.post_title?.snippet;
    if (snippet) return { value: snippet, highlighted: true };
    return String(d.post_title ?? "");
  },
  SEARCH_HIT_SUBHEADING: (d) =>
    String(d.post_type_name ?? d.post_date_formatted ?? ""),
  SEARCH_HIT_EXCERPT: (d, h) => {
    const snippet = h?.post_excerpt?.snippet ?? h?.content?.snippet;
    if (snippet) return { value: snippet, highlighted: true };
    return String(d.post_excerpt ?? "");
  },
  SEARCH_HIT_LINK: (d) => String(d.permalink ?? "#"),
  SEARCH_HIT_IMAGE_URL: (d) => String(d.thumbnail ?? ""),
  SEARCH_HIT_IMAGE_ALT: (d) => String(d.thumbnail_alt ?? ""),
  SEARCH_HIT_ARIA_LABEL: (d) => `Read more: ${d.post_title ?? ""}`,
  SEARCH_HIT_DATE: (d) => String(d.post_date_formatted ?? ""),
  /** For simpleview: "Lov · 2026-03-04" */
  SEARCH_HIT_META: (d) => {
    const type = String(d.post_type_name ?? "");
    const date = String(d.post_date_formatted ?? "");
    return [type, date].filter(Boolean).join(" · ");
  },
};

export function getHitTemplates(): Map<string, string> {
  const map = new Map<string, string>();
  const container = document.querySelector("[data-js-search-page-container]");
  if (!container) return map;

  container.querySelectorAll("template").forEach((template) => {
    const el = template as HTMLElement;
    for (let i = 0; i < el.attributes.length; i++) {
      const name = el.attributes[i].name;
      if (
        name.startsWith("data-js-search-hit-template-") &&
        el.attributes[i].value !== "false"
      ) {
        const type = name.replace("data-js-search-hit-template-", "");
        map.set(type, (template as HTMLTemplateElement).innerHTML);
        break;
      }
    }
  });

  return map;
}

function pickTemplate(
  doc: Record<string, unknown>,
  templates: Map<string, string>,
): string {
  const postType = String(doc.post_type ?? "");
  const postTypeName = String(doc.post_type_name ?? "");
  const hasImage = doc.thumbnail && String(doc.thumbnail).length > 0;
  const customTypes = window.municipioSearchConfig?.customTemplateTypes ?? {};
  const customTypesByName =
    window.municipioSearchConfig?.customTemplateTypesByPostTypeName ?? {};

  const customTemplateKey =
    customTypes[postType] ?? customTypesByName[postTypeName];

  if (customTemplateKey && templates.has(customTemplateKey)) {
    return templates.get(customTemplateKey)!;
  }
  if (templates.has(postType)) return templates.get(postType)!;
  if (templates.has(postTypeName)) return templates.get(postTypeName)!;
  if (hasImage && templates.has("image")) return templates.get("image")!;
  if (templates.has("noimage")) return templates.get("noimage")!;
  return templates.get("default") ?? "";
}

function replacePlaceholders(
  html: string,
  doc: Record<string, unknown>,
  highlight?: Record<string, TypesenseHighlightField>,
): string {
  let result = html;
  Object.entries(PLACEHOLDERS).forEach(([key, fn]) => {
    const out = fn(doc, highlight);
    const value =
      typeof out === "object" && out.highlighted
        ? escapeHtmlPreservingMarks(out.value)
        : escapeHtml(decodeHtmlEntities(String(out)));
    result = result.replaceAll(`{${key}}`, value);
  });
  return result;
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Decode HTML entities like &Aring; &auml; &nbsp; to their actual characters.
 */
function decodeHtmlEntities(str: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
}

/**
 * Escape HTML but preserve <mark> tags from Typesense highlighting.
 * Also decodes HTML entities first (e.g. &Aring; -> Å).
 */
function escapeHtmlPreservingMarks(str: string): string {
  // First decode HTML entities, then handle marks
  const decoded = decodeHtmlEntities(str);

  // Use unique placeholders that won't appear in content
  const markPlaceholder = "\u0000\u0001MARK_START\u0001\u0000";
  const markEndPlaceholder = "\u0000\u0001MARK_END\u0001\u0000";

  const withPlaceholders = decoded
    .replace(/<mark>/gi, markPlaceholder)
    .replace(/<\/mark>/gi, markEndPlaceholder);

  const escaped = escapeHtml(withPlaceholders);

  return escaped
    .replace(new RegExp(markPlaceholder, "g"), "<mark>")
    .replace(new RegExp(markEndPlaceholder, "g"), "</mark>");
}

export function renderHit(
  hit: TypesenseHit,
  templates: Map<string, string>,
): string {
  console.log("hit", hit);
  const doc = hit.document;
  const highlight = hit.highlight;
  const templateHtml = pickTemplate(doc, templates);
  return replacePlaceholders(templateHtml, doc, highlight);
}

export function getTemplate(selector: string): string {
  const el = document.querySelector(`template${selector}`);
  return el ? (el as HTMLTemplateElement).innerHTML : "";
}

export function renderStats(count: number): string {
  const template = getTemplate("[data-js-search-page-stat]");
  if (!template) return String(count);
  return template.replaceAll("{SEARCH_STATS_COUNT}", String(count));
}

export function renderNoResults(): string {
  return getTemplate("[data-js-search-page-no-results]") || "";
}

export function renderFacetPanel(label: string, itemsHtml: string): string {
  const template = getTemplate("[data-js-search-page-facet]");
  if (!template) return "";
  return template
    .replaceAll("{SEARCH_FACET_LABEL}", escapeHtml(label))
    .replaceAll("{SEARCH_FACET_ITEMS}", itemsHtml);
}

export function renderFacetItem(
  attribute: string,
  value: string,
  count: number,
  checked: boolean,
): string {
  const template = getTemplate("[data-js-search-page-facet-item]");
  if (!template) return "";
  const id = `facet_${attribute}_${value}`.replace(/[^a-zA-Z0-9_-]/g, "_");
  let html = template
    .replaceAll("{SEARCH_FACET_ATTRIBUTE}", escapeHtml(attribute))
    .replaceAll("{SEARCH_FACET_VALUE}", escapeHtml(value))
    .replaceAll("{SEARCH_FACET_COUNT}", String(count))
    .replace(/value="[^"]*"/, `value="${escapeHtml(value)}"`)
    .replace(/id="[^"]*"/, `id="${id}"`);
  if (checked) {
    html = html.replace(/type="checkbox"/, 'type="checkbox" checked');
  }
  return html;
}

export function renderPaginationItem(
  page: number,
  label: string,
  href: string,
  isCurrent: boolean,
): string {
  const template = getTemplate("[data-js-search-page-pagination-item]");
  if (!template) return "";
  const color = isCurrent ? "primary" : "default";
  const cls = isCurrent ? "is-current" : "";
  return template
    .replaceAll("{SEARCH_PAGINATION_PAGE_NUMBER}", String(page))
    .replaceAll("{SEARCH_PAGINATION_TEXT}", escapeHtml(label))
    .replaceAll("{SEARCH_PAGINATION_HREF}", href)
    .replaceAll("{SEARCH_PAGINATION_COLOR}", color)
    .replaceAll("{SEARCH_PAGINATION_CLASS}", cls);
}
