<?php
/** @var \Kirby\Cms\Block $block */
?>
<blockquote class="doc-quote">
    <?= $block->text() ?>
    <?php if ($block->citation()->isNotEmpty()): ?>
    <footer class="doc-quote-citation"><?= $block->citation() ?></footer>
    <?php endif ?>
</blockquote>
