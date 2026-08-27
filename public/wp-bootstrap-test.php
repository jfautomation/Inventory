<?php

$start = microtime(true);

function profile_mark($name) {
    global $start;

    $now = microtime(true);

    file_put_contents(
        __DIR__ . '/wp-bootstrap-profile.log',
        $name . ': ' . round(($now - $start) * 1000, 2) . " ms" . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );

    $start = $now;
}

profile_mark('START');

require __DIR__ . '/wp-load.php';

profile_mark('AFTER wp-load.php');

echo 'BOOTSTRAP COMPLETE';
