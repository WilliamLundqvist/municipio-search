@element([
    'id' => 'municipio-search__search-container',
    'classList' => ['municipio-search__search-container'],
    'attributeList' => [
        'data-js-search-page-search-container' => true
    ]
])
    @field([
        'classList' => ['c-paper'],
        'attributeList' => [
            'data-js-search-page-search-input' => true,
            'aria-label' => $lang['searchLabel']
        ],
        'type' => 'search',
        'name' => 'search',
        'required' => true,
        'label' => false,
        'icon' => ['icon' => 'search']
    ])
    @endfield
@endelement
