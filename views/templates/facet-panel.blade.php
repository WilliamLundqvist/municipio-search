@element([
    'componentElement' => 'template',
    'attributeList' => [
        'data-js-search-page-facet' => true
    ]
])
@element(['classList' => ['municipio-search__facet-group']])
    @typography([
        'variant' => 'h2',
        'element' => 'h2',
        'classList' => ['municipio-search__facet-group-heading']
    ])
        {SEARCH_FACET_LABEL}
    @endtypography

    @element(['classList' => ['municipio-search__facet-group-content']])
        {SEARCH_FACET_ITEMS}
    @endelement
@endelement
@endelement
