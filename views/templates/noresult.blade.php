@element([
    'componentElement' => 'template',
    'attributeList' => [
        'data-js-search-page-no-results' => true
    ],
])
@notice([
    'type' => 'info',
    'message' => [
        'text' => $lang['noresults'],
        'size' => 'sm'
    ],
    'icon' => [
        'name' => 'report',
        'size' => 'md',
        'color' => 'white'
    ]
])
@endnotice
@endelement
