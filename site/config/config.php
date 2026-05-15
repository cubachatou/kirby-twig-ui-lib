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

    // Register the @ui Twig namespace.
    // Paths are searched in order — place the project-local directory first so
    // any file in site/snippets/ui/ silently overrides the plugin template.
    // The plugin path acts as the fallback when no project file is present.
    // Register the @docs namespace for shared doc-site layout snippets.
    'wearejust.twig.namespaces' => [
        'ui'   => [
            __DIR__ . '/../snippets/ui',
            __DIR__ . '/../plugins/kui/snippets/blocks',
        ],
        'docs' => __DIR__ . '/../snippets/docs',
    ],
];
