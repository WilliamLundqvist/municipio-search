<?php

declare(strict_types=1);

namespace MunicipioSearch\Helper;

class Lang
{
    public static function getLang(): array
    {
        return [
            'searchLabel' => __('What are you looking for?', 'municipio-search'),
            'placeholder' => __('What are you looking for?', 'municipio-search'),
            'noresults' => __('No search results found on your query.', 'municipio-search'),
            'stats' => sprintf(
                __('%s search results found.', 'municipio-search'),
                '{SEARCH_STATS_COUNT}',
            ),
            'nofacets' => __('No facets available for your search.', 'municipio-search'),
            'applyFilters' => __('Apply filters', 'municipio-search'),
            'clearFilters' => __('Clear filters', 'municipio-search'),
            'openFilters' => __('Filters', 'municipio-search'),
            'sortBy' => __('Sort by', 'municipio-search'),
            'sortRelevance' => __('Relevance', 'municipio-search'),
            'sortDateNewest' => __('Date (newest)', 'municipio-search'),
            'sortDateOldest' => __('Date (oldest)', 'municipio-search'),
            'search' => __('Search', 'municipio-search'),
        ];
    }
}
