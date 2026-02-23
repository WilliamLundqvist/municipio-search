@element([
    'id' => 'municipio-search__hits',
    'classList' => ['municipio-search__hits'],
    'attributeList' => [
        'data-js-search-page-hits' => true
    ]
])
    @include('partials.hits-loader')
@endelement
