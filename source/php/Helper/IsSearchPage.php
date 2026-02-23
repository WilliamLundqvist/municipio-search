<?php

declare(strict_types=1);

namespace MunicipioSearch\Helper;

class IsSearchPage
{
    public static function isSearchPage(): bool
    {
        static $isSearchPage = null;
        if ($isSearchPage !== null) {
            return $isSearchPage;
        }

        $isSearchPage = false;

        if (!self::isTypesenseConfigured()) {
            return false;
        }

        $path = trim(strtok($_SERVER['REQUEST_URI'] ?? '', '?'), '/');

        if (is_multisite() && defined('SUBDOMAIN_INSTALL') && SUBDOMAIN_INSTALL === false) {
            $blogDetails = get_blog_details();
            $sitePath = trim($blogDetails->path ?? '', '/');
            if ($path === $sitePath && is_search()) {
                return $isSearchPage = true;
            }
        }

        if ($path === '' && is_search()) {
            return $isSearchPage = true;
        }

        if (is_search()) {
            return $isSearchPage = true;
        }

        return $isSearchPage;
    }

    private static function isTypesenseConfigured(): bool
    {
        if (class_exists(\AlgoliaIndexTypesenseProvider\Helper\Options::class)) {
            $options = \AlgoliaIndexTypesenseProvider\Helper\Options::class;
            return !empty($options::apiUrl()) && !empty($options::publicApiKey());
        }

        if (defined('TYPESENSEINDEX_API_URL') && defined('TYPESENSEINDEX_PUBLIC_API_KEY')) {
            return !empty(TYPESENSEINDEX_API_URL) && !empty(TYPESENSEINDEX_PUBLIC_API_KEY);
        }

        return false;
    }
}
