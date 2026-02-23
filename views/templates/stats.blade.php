@element([
    'componentElement' => 'template',
    'attributeList' => [
        'data-js-search-page-stat' => true
    ]
])
@typography([
    'variant' => 'meta',
    'element' => 'div',
    'classList' => ['u-color__text--dark']
])
    {{ $lang['stats'] }}
@endtypography
@endelement
