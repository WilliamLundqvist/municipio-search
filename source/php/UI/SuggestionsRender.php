<?php

declare(strict_types=1);

namespace MunicipioSearch\UI;

use MunicipioSearch\Blade\Blade;
use MunicipioSearch\Config\SearchConfig;

class SuggestionsRender
{
    public function __construct(
        private Blade $blade,
    ) {
    }

    public function renderSuggestions(): void
    {
        $config = SearchConfig::getTypesenseConfig();
        if (empty($config['apiKey']) || empty($config['collection'])) {
            return;
        }

        echo $this->blade->render(
            'suggestions.suggestion-container',
            [],
            true,
            [MUNICIPIO_SEARCH_VIEW_PATH],
        );
    }
}
