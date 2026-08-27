<?php
/**
 * Inventory Theme Functions
 */

/**
 * Load React build assets (CRA via asset-manifest.json)
 */

function inventory_react_app_assets() {

    $build_dir = get_template_directory() . '/build';
    $build_uri = get_template_directory_uri() . '/build';

    // Find the CRA main JS bundle
    $js_files = glob($build_dir . '/static/js/main.*.js');

    if (!empty($js_files)) {

        $js_file = $js_files[0];

        wp_enqueue_script(
            'inventory-app',
            $build_uri . '/static/js/' . basename($js_file),
            [],
            null,
            true
        );
    }

    // Find the CRA main CSS bundle
    $css_files = glob($build_dir . '/static/css/main.*.css');

    if (!empty($css_files)) {

        $css_file = $css_files[0];

        wp_enqueue_style(
            'inventory-app',
            $build_uri . '/static/css/' . basename($css_file),
            [],
            null
        );
    }
}

add_action('wp_enqueue_scripts', 'inventory_react_app_assets');



add_action('wp_enqueue_scripts', 'inventory_react_app_assets');


/**
 * =========================
 * SPA ROUTING (React HANDLED)
 * =========================
 */
add_action('template_redirect', function () {

    // Never interfere with REST API
    if (defined('REST_REQUEST') && REST_REQUEST) {
        return;
    }

    $uri = $_SERVER['REQUEST_URI'] ?? '/';

    // Let React handle these routes
    if (
        str_starts_with($uri, '/inventory-app') ||
        str_starts_with($uri, '/products') ||
        str_starts_with($uri, '/parts')
    ) {
        status_header(200);
        include get_template_directory() . '/index.php';
        exit;
    }
}, 0);


/**
 * =========================
 * REMOVE WP LOGIN REDIRECTS
 * =========================
 */
remove_action('template_redirect', 'wp_redirect_admin_locations', 1000);


/**
 * =========================
 * DEBUG HOOKS
 * =========================
 */
add_action('rest_api_init', function () {
    error_log('🔥 REST API INIT FIRED');
});

add_action('init', function () {
    error_log('🔥 WP INIT FIRED');
});