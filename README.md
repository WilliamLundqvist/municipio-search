# Municipio Search

Typesense-powered client-side search for Municipio sites. Replaces the Helsingborg-stad algolia-index-js-searchpage-addon with a standalone, customer-owned solution.

## Requirements

- WordPress with Municipio theme
- [algolia-index](https://github.com/helsingborg-stad/algolia-index) plugin
- [algolia-index-typesense-provider](https://github.com/helsingborg-stad/algolia-index-typesense-provider) plugin

## Setup

1. Install dependencies: `composer install` and `npm install`
2. Build assets: `npm run build`
3. Activate the plugin in WordPress
4. Deactivate the algolia-index-js-searchpage-addon plugin when using this one

## Configuration

Typesense connection is read from the same constants/options as the typesense provider:

- `TYPESENSEINDEX_API_URL` / `algolia_index_typesense_api_url`
- `TYPESENSEINDEX_PUBLIC_API_KEY` / `algolia_index_typesense_public_api_key`
- `TYPESENSEINDEX_COLLECTION_NAME` / `algolia_index_typesense_collection_name`

For local development with DDEV, the plugin auto-detects when the host is `typesense` (Docker internal) and uses the current site's origin for browser requests (e.g. when proxying `/collections/` via nginx).

## Facets

Configure facets via the existing `AlgoliaIndex/Facets` filter:

```php
add_filter('AlgoliaIndex/Facets', function () {
    return [
        ['attribute' => 'top_most_parent', 'label' => __('Department'), 'enabled' => true],
        ['attribute' => 'post_type_name', 'label' => __('Content Type'), 'enabled' => true],
    ];
});
```

## Custom hit templates

Register per-type templates via `MunicipioSearch/HitTemplates`:

```php
add_filter('MunicipioSearch/HitTemplates', function ($templates) {
    $templates['event'] = 'templates.hit-event';
    return $templates;
});

add_filter('MunicipioSearch/TemplatePaths', function ($paths) {
    $paths[] = get_stylesheet_directory() . '/municipio-search/';
    return $paths;
});
```

Then create `hit-event.blade.php` in your theme with the same structure as other hit templates (e.g. `hit-default.blade.php`), using `data-js-search-hit-template-event` on the template element.

## Filters

- `MunicipioSearch/TypesenseConfig` – Override Typesense connection config
- `MunicipioSearch/TemplatePaths` – Add view paths for custom templates
- `MunicipioSearch/HitTemplates` – Register hit templates per post type
- `MunicipioSearch/SearchParams` – Modify search parameters
