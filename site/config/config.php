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
        // page_children(page) — returns listed children without triggering
        // Twig's public-property resolution (Pages|null $children = null).
        'page_children' => function ($page) {
            return $page->children()->listed();
        },
    ],

    // Register the @ui Twig namespace so that any template can reference
    // kui snippets as @ui/filename.twig — mirrors the @ui Vite alias
    // declared in site/plugins/kui/vite.config.js.
    // Register the @docs namespace for shared doc-site layout snippets.
    'wearejust.twig.namespaces' => [
        'ui'   => __DIR__ . '/../plugins/kui/snippets/blocks',
        'docs' => __DIR__ . '/../snippets/docs',
    ],
];
