<?php
/*
Plugin Name: Inventory Products
Description: Headless inventory system (WordPress = API only, React = UI).
Version: 4.0.0
Author: Tatyana
*/

if (!defined('ABSPATH')) {
    exit;
}


/*
|--------------------------------------------------------------------------
| TEMPORARY PERFORMANCE PROFILING
|--------------------------------------------------------------------------
*/

$inventory_profile_start = microtime(true);

function inventory_profile_log($message)
{
    $file = WP_CONTENT_DIR . '/inventory-profile.log';

    file_put_contents(
        $file,
        '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

inventory_profile_log('=== INVENTORY PLUGIN PROFILE START ===');


/*
|--------------------------------------------------------------------------
| CORE
|--------------------------------------------------------------------------
*/

$inventory_step_start = microtime(true);

require_once __DIR__ . '/core/product-cpt.php';

inventory_profile_log(
    'INVENTORY TIMING | product-cpt.php: ' .
    round((microtime(true) - $inventory_step_start) * 1000, 2) .
    ' ms'
);


$inventory_step_start = microtime(true);

require_once __DIR__ . '/core/taxonomies.php';

inventory_profile_log(
    'INVENTORY TIMING | taxonomies.php: ' .
    round((microtime(true) - $inventory_step_start) * 1000, 2) .
    ' ms'
);


/*
|--------------------------------------------------------------------------
| DOMAIN
|--------------------------------------------------------------------------
|
| MUST load before API files that use inventory business rules.
|
*/

$inventory_step_start = microtime(true);

require_once __DIR__ . '/domain/inventory-rules.php';

inventory_profile_log(
    'INVENTORY TIMING | inventory-rules.php: ' .
    round((microtime(true) - $inventory_step_start) * 1000, 2) .
    ' ms'
);


/*
|--------------------------------------------------------------------------
| ENGINE
|--------------------------------------------------------------------------
|
| Currently disabled.
|
*/

// $inventory_step_start = microtime(true);

// require_once __DIR__ . '/domain/part-stock-engine.php';

// inventory_profile_log(
//     'INVENTORY TIMING | part-stock-engine.php: ' .
//     round((microtime(true) - $inventory_step_start) * 1000, 2) .
//     ' ms'
// );


/*
|--------------------------------------------------------------------------
| ADMIN UI
|--------------------------------------------------------------------------
|
| Currently disabled.
|
*/

// $inventory_step_start = microtime(true);

// require_once __DIR__ . '/admin/part-meta-ui.php';

// inventory_profile_log(
//     'INVENTORY TIMING | part-meta-ui.php: ' .
//     round((microtime(true) - $inventory_step_start) * 1000, 2) .
//     ' ms'
// );


// $inventory_step_start = microtime(true);

// require_once __DIR__ . '/admin/series-meta-ui.php';

// inventory_profile_log(
//     'INVENTORY TIMING | series-meta-ui.php: ' .
//     round((microtime(true) - $inventory_step_start) * 1000, 2) .
//     ' ms'
// );


/*
|--------------------------------------------------------------------------
| API — REST ENDPOINTS
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| PRODUCT ENDPOINTS
|--------------------------------------------------------------------------
|
| Depends on:
| - product-cpt.php
| - taxonomies.php
| - inventory-rules.php
|
*/

$inventory_step_start = microtime(true);

require_once __DIR__ . '/api/product-endpoints.php';

inventory_profile_log(
    'INVENTORY TIMING | product-endpoints.php: ' .
    round((microtime(true) - $inventory_step_start) * 1000, 2) .
    ' ms'
);


/*
|--------------------------------------------------------------------------
| PART ENDPOINTS
|--------------------------------------------------------------------------
*/

$inventory_step_start = microtime(true);

require_once __DIR__ . '/api/parts-endpoints.php';

inventory_profile_log(
    'INVENTORY TIMING | parts-endpoints.php: ' .
    round((microtime(true) - $inventory_step_start) * 1000, 2) .
    ' ms'
);


/*
|--------------------------------------------------------------------------
| TAXONOMY ENDPOINTS
|--------------------------------------------------------------------------
*/

$inventory_step_start = microtime(true);

require_once __DIR__ . '/api/taxonomy-endpoints.php';

inventory_profile_log(
    'INVENTORY TIMING | taxonomy-endpoints.php: ' .
    round((microtime(true) - $inventory_step_start) * 1000, 2) .
    ' ms'
);


/*
|--------------------------------------------------------------------------
| SERIES ENDPOINTS
|--------------------------------------------------------------------------
*/

$inventory_step_start = microtime(true);

require_once __DIR__ . '/api/series-endpoints.php';

inventory_profile_log(
    'INVENTORY TIMING | series-endpoints.php: ' .
    round((microtime(true) - $inventory_step_start) * 1000, 2) .
    ' ms'
);


/*
|--------------------------------------------------------------------------
| PART SUMMARY ENDPOINT
|--------------------------------------------------------------------------
*/

$inventory_step_start = microtime(true);

require_once __DIR__ . '/api/part-summary-endpoint.php';

inventory_profile_log(
    'INVENTORY TIMING | part-summary-endpoint.php: ' .
    round((microtime(true) - $inventory_step_start) * 1000, 2) .
    ' ms'
);


/*
|--------------------------------------------------------------------------
| MEDIA ENDPOINTS
|--------------------------------------------------------------------------
*/

$inventory_step_start = microtime(true);

require_once __DIR__ . '/api/media-endpoints.php';

inventory_profile_log(
    'INVENTORY TIMING | media-endpoints.php: ' .
    round((microtime(true) - $inventory_step_start) * 1000, 2) .
    ' ms'
);


/*
|--------------------------------------------------------------------------
| BOOTSTRAP ENDPOINT
|--------------------------------------------------------------------------
|
| Must load AFTER product-endpoints.php because bootstrap uses
| inventory_transform_product().
|
*/

$inventory_step_start = microtime(true);

require_once __DIR__ . '/api/bootstrap-endpoint.php';

inventory_profile_log(
    'INVENTORY TIMING | bootstrap-endpoint.php: ' .
    round((microtime(true) - $inventory_step_start) * 1000, 2) .
    ' ms'
);


/*
|--------------------------------------------------------------------------
| DEBUG ENDPOINTS
|--------------------------------------------------------------------------
*/

$inventory_step_start = microtime(true);

require_once __DIR__ . '/api/debug-endpoints.php';

inventory_profile_log(
    'INVENTORY TIMING | debug-endpoints.php: ' .
    round((microtime(true) - $inventory_step_start) * 1000, 2) .
    ' ms'
);


/*
|--------------------------------------------------------------------------
| FRONTEND NONCE / GLOBAL JS BRIDGE
|--------------------------------------------------------------------------
*/

add_action('wp_head', function () {
    ?>
<script>
window.wpApiSettings = {
    root: "<?php echo esc_url_raw(rest_url()); ?>",
    nonce: "<?php echo wp_create_nonce('wp_rest'); ?>"
};
</script>
<?php
});


/*
|--------------------------------------------------------------------------
| TOTAL PLUGIN BOOTSTRAP TIME
|--------------------------------------------------------------------------
*/

inventory_profile_log(
    'INVENTORY TIMING | TOTAL PLUGIN BOOTSTRAP: ' .
    round((microtime(true) - $inventory_profile_start) * 1000, 2) .
    ' ms'
);

inventory_profile_log('=== INVENTORY PLUGIN PROFILE END ===');