<?php

function viteAsset(string $entry): array
{
    static $manifest = null;
    if ($manifest === null) {
        $path = kirby()->root('index') . '/assets/dist/.vite/manifest.json';
        $manifest = is_file($path) ? json_decode(file_get_contents($path), true) : [];
    }
    return $manifest[$entry] ?? [];
}

return [
    'debug' => true,
    'url'   => 'http://localhost:8000',

    'wearejust.twig.env.functions' => [
        'vite_asset' => 'viteAsset',
    ],

    // Register the @ui Twig namespace so that any template can reference
    // ui-library snippets as @ui/filename.twig — mirrors the @ui Vite alias
    // declared in site/plugins/ui-library/vite.config.js.
    'wearejust.twig.namespaces' => [
        'ui' => __DIR__ . '/../plugins/ui-library/snippets/blocks',
    ],
];
