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
    'wearejust.twig.env.functions' => [
        'vite_asset' => 'viteAsset',
    ],
];
