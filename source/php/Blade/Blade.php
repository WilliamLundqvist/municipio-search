<?php

declare(strict_types=1);

namespace MunicipioSearch\Blade;

use ComponentLibrary\Init as ComponentLibraryInit;
use HelsingborgStad\BladeService\BladeServiceInterface;

class Blade
{
    private BladeServiceInterface $bladeEngine;

    public function __construct(
        private ComponentLibraryInit $componentLibrary,
    ) {
        $this->bladeEngine = $this->componentLibrary->getEngine();
    }

    public function render(string $view, array $data = [], bool $compress = true, array $viewPaths = []): string
    {
        $viewPaths = $viewPaths ?: [MUNICIPIO_SEARCH_VIEW_PATH];
        $data = array_merge($data, ['errorMessage' => false]);
        $markup = '';

        try {
            $markup = $this->bladeEngine->makeView($view, $data, [], $viewPaths)->render();
        } catch (\Throwable $e) {
            $this->bladeEngine->errorHandler($e)->print();
        }

        if ($compress) {
            $markup = preg_replace('~<!--(.*?)-->~s', '', $markup);
            $markup = preg_replace("/\r|\n/", '', $markup);
            $markup = preg_replace('!\s+!', ' ', $markup);
        }

        return $markup;
    }
}
