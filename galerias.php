<?php
// Detecção de fotos para hospedagens PHP, sem depender de nomes fixos.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$base = __DIR__ . '/assets/servicos';
$result = [];
foreach (glob($base . '/*/*', GLOB_ONLYDIR) ?: [] as $folder) {
    $key = basename(dirname($folder)) . '/' . basename($folder);
    $files = array_filter(glob($folder . '/*') ?: [], function ($file) {
        return is_file($file) && preg_match('/\.(jpe?g|png|webp|avif|gif)$/i', $file);
    });
    natsort($files);
    $result[$key] = array_values(array_map(function ($file) use ($key) {
        return 'assets/servicos/' . $key . '/' . basename($file);
    }, $files));
}
echo json_encode((object)$result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
