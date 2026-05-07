<?php
/** @var \Kirby\Cms\Block $block */

// Map Kirby's language keys to Prism.js language identifiers
$langMap = [
    'js'      => 'javascript',
    'text'    => 'plaintext',
    'shell'   => 'bash',
    'markup'  => 'html',
];

$lang  = $block->language()->or('plaintext')->value();
$prism = $langMap[$lang] ?? $lang;
$code  = $block->code()->value();
?>
<div class="doc-code" data-copy-block>
    <pre><code class="language-<?= htmlspecialchars($prism, ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars((string)$code, ENT_NOQUOTES, 'UTF-8') ?></code></pre>
</div>
