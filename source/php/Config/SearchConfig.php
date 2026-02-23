<?php

declare(strict_types=1);

namespace MunicipioSearch\Config;

class SearchConfig
{
    public static function getTypesenseConfig(): array
    {
        $host = '';
        $port = 443;
        $protocol = 'https';
        $apiKey = '';
        $collection = '';

        if (class_exists(\AlgoliaIndexTypesenseProvider\Helper\Options::class)) {
            $options = \AlgoliaIndexTypesenseProvider\Helper\Options::class;
            $apiKey = $options::publicApiKey() ?? '';
            $collection = $options::collectionName() ?? '';
            $apiUrl = $options::apiUrl() ?? '';
            if (!empty($apiUrl)) {
                $parts = parse_url($apiUrl);
                $host = $parts['host'] ?? '';
                $port = isset($parts['port']) ? (int) $parts['port'] : (($parts['scheme'] ?? 'https') === 'https' ? 443 : 80);
                $protocol = $parts['scheme'] ?? 'https';
            }
        } elseif (defined('TYPESENSEINDEX_API_URL') && defined('TYPESENSEINDEX_PUBLIC_API_KEY') && defined('TYPESENSEINDEX_COLLECTION_NAME')) {
            $apiKey = TYPESENSEINDEX_PUBLIC_API_KEY;
            $collection = TYPESENSEINDEX_COLLECTION_NAME;
            $parts = parse_url(TYPESENSEINDEX_API_URL);
            $host = $parts['host'] ?? '';
            $port = isset($parts['port']) ? (int) $parts['port'] : 443;
            $protocol = $parts['scheme'] ?? 'https';
        }

        $config = [
            'host' => $host,
            'port' => $port,
            'protocol' => $protocol,
            'apiKey' => $apiKey,
            'collection' => $collection,
        ];

        // When host is Docker-internal (e.g. typesense:8108), use same-origin for browser requests.
        // Sites typically proxy /collections/ to Typesense. Filter allows override.
        if ($host === 'typesense' || $host === 'localhost') {
            $home = parse_url(home_url());
            $config['host'] = $home['host'] ?? $host;
            $config['port'] = isset($home['port']) ? (int) $home['port'] : (($home['scheme'] ?? 'https') === 'https' ? 443 : 80);
            $config['protocol'] = $home['scheme'] ?? 'https';
        }

        return apply_filters('MunicipioSearch/TypesenseConfig', $config);
    }

    public static function getSearchParams(): array
    {
        return apply_filters('MunicipioSearch/SearchParams', [
            'query' => get_search_query(),
            'queryBy' => 'post_title,post_excerpt,content',
            'perPage' => 20,
            'page' => get_query_var('paged') ? (int) get_query_var('paged') : 1,
            'highlightFields' => 'post_title,post_excerpt',
        ]);
    }

    public static function getFacets(): array
    {
        $facets = apply_filters('AlgoliaIndex/Facets', []);
        return array_values(array_filter($facets, fn($f) => !empty($f['enabled'])));
    }

    public static function isFacetingEnabled(): bool
    {
        return !empty(self::getFacets());
    }
}
