<?php
/** @var \Kirby\Cms\Block $block */

// Kirby's table block stores rows in the 'body' field as a nested YAML array.
// Each element is an array of cell values (strings).
$hasHead = $block->content()->get('head')->toBool();
$rows    = $block->content()->get('body')->yaml();

if (empty($rows)) {
    return;
}
?>
<div class="mb-6">
    <table class="doc-table">
        <?php if ($hasHead): ?>
        <thead>
            <tr>
                <?php foreach ((array)($rows[0] ?? []) as $cell): ?>
                <th><?= htmlspecialchars(is_array($cell) ? '[' . implode(', ', $cell) . ']' : (string)$cell) ?></th>
                <?php endforeach ?>
            </tr>
        </thead>
        <tbody>
            <?php foreach (array_slice($rows, 1) as $row): ?>
            <tr>
                <?php foreach ((array)$row as $cell): ?>
                <td><?= htmlspecialchars(is_array($cell) ? '[' . implode(', ', $cell) . ']' : (string)$cell) ?></td>
                <?php endforeach ?>
            </tr>
            <?php endforeach ?>
        </tbody>
        <?php else: ?>
        <tbody>
            <?php foreach ($rows as $row): ?>
            <tr>
                <?php foreach ((array)$row as $cell): ?>
                <td><?= htmlspecialchars(is_array($cell) ? '[' . implode(', ', $cell) . ']' : (string)$cell) ?></td>
                <?php endforeach ?>
            </tr>
            <?php endforeach ?>
        </tbody>
        <?php endif ?>
    </table>
</div>
