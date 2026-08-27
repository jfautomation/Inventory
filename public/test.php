<?php

$start = microtime(true);

for ($i = 0; $i < 1000000; $i++) {
    $x = $i * 2;
}

echo "PHP execution: " . round((microtime(true) - $start) * 1000, 2) . " ms";