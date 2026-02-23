<?php

declare(strict_types=1);

namespace MunicipioSearch\UI;

use MunicipioSearch\Blade\Blade;
use MunicipioSearch\Config\SearchConfig;
use MunicipioSearch\Helper\IsSearchPage;
use MunicipioSearch\Helper\Lang;

class Render
{
    private static bool $hasRenderedSearchPage = false;

    public function __construct(
        private Blade $blade,
    ) {
    }

    public function renderSearchPage(): void
    {
        if (!$this->shouldRenderSearchPage()) {
            return;
        }

        $hitTemplates = apply_filters('MunicipioSearch/HitTemplates', [
            'default' => 'templates.hit-default',
            'image' => 'templates.hit-image',
            'noimage' => 'templates.hit-noimage',
        ]);
        $templates = $this->getTemplateFiles($hitTemplates);

        $viewPaths = array_merge(
            [MUNICIPIO_SEARCH_VIEW_PATH],
            apply_filters('MunicipioSearch/TemplatePaths', [])
        );

        echo $this->blade->render(
            'search-page',
            [
                'lang' => Lang::getLang(),
                'facetingEnabled' => SearchConfig::isFacetingEnabled(),
                'templates' => $templates,
                'hitTemplateTypes' => array_keys($hitTemplates),
            ],
            true,
            $viewPaths,
        );

        self::$hasRenderedSearchPage = true;
    }

    private function shouldRenderSearchPage(): bool
    {
        return !self::$hasRenderedSearchPage && IsSearchPage::isSearchPage();
    }

    /**
     * @param array<string, string> $hitTemplates
     */
    private function getTemplateFiles(array $hitTemplates): array
    {
        $files = [];
        $fullPath = MUNICIPIO_SEARCH_VIEW_PATH . 'templates/';

        if (is_dir($fullPath)) {
            $dirHandle = opendir($fullPath);
            if ($dirHandle) {
                while (($file = readdir($dirHandle)) !== false) {
                    if ($file !== '.' && $file !== '..' && is_file($fullPath . $file)) {
                        $bladeName = 'templates.' . preg_replace('/\.blade\.php$/', '', $file);
                        $files[] = $bladeName;
                    }
                }
                closedir($dirHandle);
            }
        }

        foreach ($hitTemplates as $viewName) {
            if (!in_array($viewName, $files, true)) {
                $files[] = $viewName;
            }
        }

        sort($files);
        return $files;
    }
}
