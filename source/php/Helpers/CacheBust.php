<?php

declare(strict_types=1);

namespace MunicipioSearch\Helpers;

class CacheBust
{
    private static ?array $manifest = null;

    public static function getFile(string $assetPath): ?array
    {
        $manifest = self::getManifest();
        $assetPath = ltrim($assetPath, '/');
        return $manifest[$assetPath] ?? null;
    }

    public static function getUrl(string $assetPath): ?string
    {
        $entry = self::getFile($assetPath);
        if (!$entry || empty($entry['file'])) {
            return null;
        }
        return rtrim(MUNICIPIO_SEARCH_URL, '/') . '/dist/' . $entry['file'];
    }

    private static function getManifest(): array
    {
        if (self::$manifest === null) {
            $manifestPath = MUNICIPIO_SEARCH_PATH . 'dist/.vite/manifest.json';
            if (file_exists($manifestPath)) {
                $decoded = json_decode((string) file_get_contents($manifestPath), true);
                self::$manifest = is_array($decoded) ? $decoded : [];
            } else {
                self::$manifest = [];
            }
        }
        return self::$manifest;
    }
}
