<?php

declare(strict_types=1);

namespace MunicipioSearch;

use MunicipioSearch\Blade\Blade;
use MunicipioSearch\Config\SearchConfig;
use MunicipioSearch\Helpers\CacheBust;
use MunicipioSearch\UI\Render;
use MunicipioSearch\UI\SuggestionsRender;

class App
{
    private Render $renderer;
    private SuggestionsRender $suggestionsRenderer;

    public function __construct()
    {
        $componentLibrary = new \ComponentLibrary\Init([]);
        $blade = new Blade($componentLibrary);
        $this->renderer = new Render($blade);
        $this->suggestionsRenderer = new SuggestionsRender($blade);

        add_filter('AlgoliaIndex/BackendSearchActive', '__return_false');
        add_filter('get_search_form', '__return_null');

        add_action('custom_search_page', [$this->renderer, 'renderSearchPage']);

        add_action('wp_enqueue_scripts', [$this, 'enqueueSearchAssets']);
        add_action('wp_enqueue_scripts', [$this, 'enqueueSuggestionAssets']);
        add_action('wp_footer', [$this->suggestionsRenderer, 'renderSuggestions']);

        add_filter('WpSecurity/Csp', [$this, 'addCspDomains']);
    }

    public function enqueueSearchAssets(): void
    {
        if (!Helper\IsSearchPage::isSearchPage()) {
            return;
        }

        $cssUrl = CacheBust::getUrl('source/sass/municipio-search.scss');
        if ($cssUrl) {
            wp_enqueue_style(
                'municipio-search',
                $cssUrl,
                [],
                MUNICIPIO_SEARCH_VERSION,
            );
        }

        $jsUrl = CacheBust::getUrl('source/js/main.ts');
        if ($jsUrl) {
            wp_enqueue_script(
                'municipio-search',
                $jsUrl,
                [],
                MUNICIPIO_SEARCH_VERSION,
                true,
            );

            $config = $this->getSearchConfig();
            wp_localize_script('municipio-search', 'municipioSearchConfig', $config);
        }
    }

    public function enqueueSuggestionAssets(): void
    {
        if (!SearchConfig::getTypesenseConfig()['apiKey']) {
            return;
        }

        $suggestionCssUrl = CacheBust::getUrl('source/sass/suggestions.scss');
        if ($suggestionCssUrl) {
            wp_enqueue_style(
                'municipio-search-suggestions',
                $suggestionCssUrl,
                [],
                MUNICIPIO_SEARCH_VERSION,
            );
        }

        $suggestionJsUrl = CacheBust::getUrl('source/js/suggestions.ts');
        if ($suggestionJsUrl) {
            wp_enqueue_script(
                'municipio-search-suggestions',
                $suggestionJsUrl,
                [],
                MUNICIPIO_SEARCH_VERSION,
                true,
            );

            $config = $this->getSuggestionConfig();
            wp_localize_script('municipio-search-suggestions', 'municipioSearchSuggestionsConfig', $config);
        }
    }

    public function addCspDomains(array $domains): array
    {
        if (!isset($domains['connect-src'])) {
            $domains['connect-src'] = [];
        }

        $typesense = SearchConfig::getTypesenseConfig();
        if (!empty($typesense['host'])) {
            $url = $typesense['protocol'] . '://' . $typesense['host'];
            if (!in_array($url, $domains['connect-src'], true)) {
                $domains['connect-src'][] = $url;
            }
        }

        return $domains;
    }

    private function getSearchConfig(): array
    {
        $typesense = SearchConfig::getTypesenseConfig();
        $searchParams = SearchConfig::getSearchParams();
        $facets = SearchConfig::getFacets();

        $hitTemplates = apply_filters('MunicipioSearch/HitTemplates', [
            'default' => 'templates.hit-default',
            'image' => 'templates.hit-image',
            'noimage' => 'templates.hit-noimage',
        ]);
        $config = [
            'typesense' => $typesense,
            'search' => $searchParams,
            'facets' => $facets,
            'translations' => Helper\Lang::getLang(),
            'hitTemplateTypes' => array_keys($hitTemplates),
            'customTemplateTypes' => apply_filters('MunicipioSearch/CustomTemplateTypes', []),
            'customTemplateTypesByPostTypeName' => apply_filters('MunicipioSearch/CustomTemplateTypesByPostTypeName', []),
        ];
        return apply_filters('MunicipioSearch/SearchConfig', $config);
    }

    private function getSuggestionConfig(): array
    {
        $typesense = SearchConfig::getTypesenseConfig();
        return [
            'typesense' => $typesense,
            'search' => [
                'queryBy' => 'post_title,post_excerpt,content',
                'perPage' => 5,
            ],
            'translations' => [
                'noresults' => __('No results found', 'municipio-search'),
            ],
        ];
    }
}
