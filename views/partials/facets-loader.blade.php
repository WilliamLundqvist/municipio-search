@foreach (range(1, 3) as $i)
    @element([
        'classList' => ['municipio-search__facet-group'],
        'attributeList' => [
            'aria-busy' => 'true',
            'aria-hidden' => 'true'
        ]
    ])
        @typography([
            'variant' => 'h2',
            'element' => 'h2',
            'classList' => [
                'municipio-search__facet-group-heading',
                'u-preloader'
            ]
        ])
            ...........
        @endtypography

        @element(['classList' => ['municipio-search__facet-group-content']])
            @foreach (range(1, 4) as $j)
                @option([
                    'type' => 'checkbox',
                    'name' => "facet_loader[{$i}][]",
                    'value' => '....',
                    'label' => '........... (..)',
                    'classList' => [
                        'u-preloader',
                        'u-margin__bottom--1'
                    ]
                ])
                @endoption
            @endforeach
        @endelement
    @endelement
@endforeach
