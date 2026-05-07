<?php
/** @var \Kirby\Cms\Block $block */
use Kirby\Toolkit\Str;

$level = $block->level()->or('h2')->value();
$text  = (string)$block->text();
$slug  = Str::slug(strip_tags($text));
$id    = htmlspecialchars($slug, ENT_QUOTES, 'UTF-8');
?>
<?php if ($level === 'h2'): ?>
<h2 class="doc-heading" id="<?= $id ?>"><?= $text ?></h2>
<?php elseif ($level === 'h3'): ?>
<h3 class="doc-subheading" id="<?= $id ?>"><?= $text ?></h3>
<?php else: ?>
<<?= $level ?> id="<?= $id ?>"><?= $text ?></<?= $level ?>>
<?php endif ?>
