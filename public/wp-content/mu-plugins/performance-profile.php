<?php
/**
 * WordPress Hook Performance Profiler
 *
 * TEMPORARY DIAGNOSTIC TOOL
 */

if (!defined('ABSPATH')) {
    exit;
}

$GLOBALS['wp_hook_profile'] = [];
$GLOBALS['wp_hook_profile_start'] = microtime(true);

function wp_profile_hook_start($hook) {
    $GLOBALS['wp_hook_profile_start_times'][$hook] = microtime(true);
}

function wp_profile_hook_end($hook) {

    if (!isset($GLOBALS['wp_hook_profile_start_times'][$hook])) {
        return;
    }

    $elapsed = microtime(true)
        - $GLOBALS['wp_hook_profile_start_times'][$hook];

    if (!isset($GLOBALS['wp_hook_profile'][$hook])) {
        $GLOBALS['wp_hook_profile'][$hook] = 0;
    }

    $GLOBALS['wp_hook_profile'][$hook] += $elapsed;
}


/*
|--------------------------------------------------------------------------
| Hooks
|--------------------------------------------------------------------------
*/

$profile_hooks = [
    'muplugins_loaded',
    'plugins_loaded',
    'setup_theme',
    'after_setup_theme',
    'init',
    'wp_loaded',
    'parse_request',
    'send_headers',
    'parse_query',
    'pre_get_posts',
    'wp',
    'template_redirect',
    'get_header',
    'wp_head',
    'wp_footer',
    'shutdown',
];

foreach ($profile_hooks as $hook) {

    add_action(
        $hook,
        function () use ($hook) {
            wp_profile_hook_start($hook);
        },
        PHP_INT_MIN
    );

    add_action(
        $hook,
        function () use ($hook) {
            wp_profile_hook_end($hook);
        },
        PHP_INT_MAX
    );
}


/*
|--------------------------------------------------------------------------
| Shutdown output
|--------------------------------------------------------------------------
*/

add_action(
    'shutdown',
    function () {

        $file = WP_CONTENT_DIR . '/wp-hook-profile.log';

        $output  = PHP_EOL;
        $output .= "==================================================" . PHP_EOL;
        $output .= "WORDPRESS HOOK PERFORMANCE PROFILE" . PHP_EOL;
        $output .= date('Y-m-d H:i:s') . PHP_EOL;
        $output .= "==================================================" . PHP_EOL;

        $total = microtime(true)
            - $GLOBALS['wp_hook_profile_start'];

        $output .= "Measured request time: "
            . round($total * 1000, 2)
            . " ms"
            . PHP_EOL;

        $output .= PHP_EOL;
        $output .= "HOOK TIMES" . PHP_EOL;
        $output .= "--------------------------------------------------" . PHP_EOL;

        $profile = $GLOBALS['wp_hook_profile'];

        arsort($profile);

        foreach ($profile as $hook => $time) {

            $output .= sprintf(
                "%-25s %10.2f ms",
                $hook,
                $time * 1000
            ) . PHP_EOL;
        }

        $output .= PHP_EOL;

        file_put_contents(
            $file,
            $output,
            FILE_APPEND | LOCK_EX
        );
    },
    PHP_INT_MAX
);