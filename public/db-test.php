<?php

require_once __DIR__ . '/wp-load.php';

$start = microtime(true);

echo "HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'NONE') . "<br>";
echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'NONE') . "<br>";

echo "home_url(): ";
flush();
$start2 = microtime(true);
echo home_url();
echo " (" . round((microtime(true) - $start2) * 1000, 2) . " ms)<br>";

echo "site_url(): ";
flush();
$start3 = microtime(true);
echo site_url();
echo " (" . round((microtime(true) - $start3) * 1000, 2) . " ms)<br>";

echo "rest_url(): ";
flush();
$start4 = microtime(true);
echo rest_url();
echo " (" . round((microtime(true) - $start4) * 1000, 2) . " ms)<br>";

echo "<br>Total bootstrap: "
    . round((microtime(true) - $start) * 1000, 2)
    . " ms";