@paper([
    'id' => 'municipio-search__container',
    'classList' => [
        'municipio-search__container',
        $facetingEnabled ? '' : 'municipio-search__container--no-facets',
    ],
    'attributeList' => [
        'data-js-search-page-container' => true
    ]
])
    @element(['id' => 'municipio-search__paint', 'classList' => ['municipio-search__paint']])
        @if($facetingEnabled)
            @element([
                'id' => 'municipio-search__facets',
                'classList' => ['municipio-search__facets'],
                'attributeList' => [
                    'data-js-toggle-item' => 'search-page-facets',
                    'data-js-toggle-class' => 'is-open',
                ]
            ])
                @include('partials.facets')
                @notice([
                    'id' => 'municipio-search__facet-notice',
                    'type' => 'info',
                    'message' => ['text' => $lang['nofacets']],
                    'classList' => ['u-margin--3'],
                    'attributeList' => ['data-js-search-page-facet-notice' => true]
                ])
                @endnotice
                @button([
                    'id' => 'municipio-search__filter-button-close',
                    'text' => $lang['applyFilters'],
                    'color' => 'default',
                    'style' => 'filled',
                    'icon' => 'filter_alt',
                    'reversePositions' => true,
                    'classList' => [
                        'u-margin__x--3',
                        'u-margin__bottom--3',
                        'u-margin__top--0',
                        'u-display--none@md',
                        'u-display--none@lg',
                        'u-display--none@xl',
                    ],
                    'attributeList' => [
                        'data-simulate-click' => "button#municipio-search__filter-button"
                    ]
                ])
                @endbutton
            @endelement
        @endif

        @element([
            'id' => 'municipio-search__results',
            'classList' => ['municipio-search__results', 'unlist']
        ])
            @element(['id' => 'municipio-search__results-header'])
                @include('partials.field')
                @include('partials.sorting')
                @include('partials.stats')
            @endelement

            @include('partials.hits')
            @include('partials.pagination')
        @endelement
    @endelement

    @foreach ($templates as $template)
        @if(!$facetingEnabled && str_starts_with($template, 'templates.facet'))
            @continue
        @endif
        @include($template)
    @endforeach
@endpaper
