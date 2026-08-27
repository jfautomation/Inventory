<?php

require_once __DIR__ . '/wp-load.php';

$start = microtime(true);

$request = new WP_REST_Request('GET', '/wp/v2/posts');

$server = rest_get_server();

$response = $server->dispatch($request);

$time = (microtime(true) - $start) * 1000;

echo "REST dispatch: " . round($time, 2) . " ms<br>";
echo "Response status: " . $response->get_status();