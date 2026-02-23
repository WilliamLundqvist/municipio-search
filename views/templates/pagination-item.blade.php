@element([
    'componentElement' => 'template',
    'attributeList' => [
        'data-js-search-page-pagination-item' => true
    ]
])
<li class="c-pagination__item">
    @button([
        'style' => 'filled',
        'size' => 'sm',
        'color' => '{SEARCH_PAGINATION_COLOR}',
        'href' => '{SEARCH_PAGINATION_HREF}',
        'classList' => [
            'c-pagination__link',
            '{SEARCH_PAGINATION_CLASS}'
        ],
        'attributeList' => [
            'data-value' => '{SEARCH_PAGINATION_PAGE_NUMBER}'
        ],
        'text' => '{SEARCH_PAGINATION_TEXT}'
    ])
    @endbutton
</li>
@endelement
