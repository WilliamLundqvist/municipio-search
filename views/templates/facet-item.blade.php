@element([
    'componentElement' => 'template',
    'attributeList' => [
        'data-js-search-page-facet-item' => true
    ]
])
@option([
    'id' => 'facet_{SEARCH_FACET_ATTRIBUTE}_{SEARCH_FACET_VALUE}',
    'type' => 'checkbox',
    'attributeList' => [
        'data-js-facet-filter' => true,
        'data-facet-attribute' => '{SEARCH_FACET_ATTRIBUTE}'
    ],
    'classList' => ['facet-item__option'],
    'name' => 'facet_{SEARCH_FACET_ATTRIBUTE}[]',
    'value' => '{SEARCH_FACET_VALUE}',
    'label' => '{SEARCH_FACET_VALUE} <span class="facet-item__count">({SEARCH_FACET_COUNT})</span>',
])
@endoption
@endelement
