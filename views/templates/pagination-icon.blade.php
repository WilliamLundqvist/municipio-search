@element([
    'componentElement' => 'template',
    'attributeList' => [
        'data-js-search-page-pagination-icon' => true
    ]
])
<li class="c-pagination__item">
    @button([
        'style' => 'filled',
        'size' => 'sm',
        'icon' => '{SEARCH_PAGINATION_ICON}',
        'color' => 'default',
        'href' => '{SEARCH_PAGINATION_HREF}',
        'classList' => ['c-pagination__link'],
        'attributeList' => ['data-value' => '{SEARCH_PAGINATION_PAGE_NUMBER}'],
    ])
    @endbutton
</li>
@endelement
