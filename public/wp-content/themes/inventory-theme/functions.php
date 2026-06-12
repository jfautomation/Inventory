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

    $manifest_path = $build_dir . '/asset-manifest.json';

    // Stop if build does not exist
    if (!file_exists($manifest_path)) {
        return;
    }

    $manifest = json_decode(file_get_contents($manifest_path), true);

    if (!$manifest || empty($manifest['files'])) {
        return;
    }

    /**
     * =========================
     * MAIN JS (CRA ENTRYPOINT)
     * =========================
     */
    if (!empty($manifest['files']['main.js'])) {
        wp_enqueue_script(
            'inventory-app',
            $build_uri . $manifest['files']['main.js'],
            [],
            null,
            true
        );
    }

    /**
     * =========================
     * CSS (ONLY IF EXISTS)
     * =========================
     * CRA sometimes does NOT output CSS
     */
    if (!empty($manifest['files']['main.css'])) {
        wp_enqueue_style(
            'inventory-app',
            $build_uri . $manifest['files']['main.css'],
            [],
            null
        );
    }
}

add_action('wp_enqueue_scripts', 'inventory_react_app_assets');

add_action('init', function () {
    add_rewrite_rule('^inventory-app/?', 'index.php', 'top');
    add_rewrite_rule('^products/?', 'index.php', 'top');
    add_rewrite_rule('^parts/?', 'index.php', 'top');
});