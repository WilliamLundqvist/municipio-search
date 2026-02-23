@element([
    'componentElement' => 'div',
    'attributeList' => [
        'data-js-search-page-sorting' => true
    ],
    'classList' => ['municipio-search__sorting']
])
    <label for="municipio-search__sort-select">{{ $lang['sortBy'] }}</label>
    <select id="municipio-search__sort-select" data-js-search-page-sort-select>
        <option value="relevance">{{ $lang['sortRelevance'] }}</option>
        <option value="date_desc">{{ $lang['sortDateNewest'] }}</option>
        <option value="date_asc">{{ $lang['sortDateOldest'] }}</option>
    </select>
@endelement
