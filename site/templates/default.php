<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= $page->title() ?></title>
  <?php if (option('debug')): ?>
    <script type="module" src="http://localhost:5173/@vite/client"></script>
    <script type="module" src="http://localhost:5173/assets/js/main.js"></script>
  <?php else: ?>
    <?php $manifest = json_decode(file_get_contents(kirby()->root('index') . '/assets/dist/.vite/manifest.json'), true) ?>
    <link rel="stylesheet" href="/assets/dist/<?= $manifest['assets/js/main.js']['css'][0] ?>">
    <script type="module" src="/assets/dist/<?= $manifest['assets/js/main.js']['file'] ?>"></script>
  <?php endif ?>
</head>
<body>
  <h1><?= $page->title() ?></h1>
</body>
</html>
