<?php
if (!defined('ABSPATH')) {
    exit;
}

error_log('🔥 BOOTSTRAP ENDPOINT FILE LOADED');


/*
|--------------------------------------------------------------------------
| REGISTER ROUTE
|--------------------------------------------------------------------------
*/

add_action('rest_api_init', function () {

    register_rest_route('inventory/v1', '/bootstrap', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'inventory_bootstrap',
    ]);
});


/*
|--------------------------------------------------------------------------
| BOOTSTRAP ENDPOINT
|--------------------------------------------------------------------------
*/

function inventory_bootstrap($request)
{
    $start = microtime(true);

    error_log('🔥 BOOTSTRAP ENDPOINT CALLED');


    /*
    |--------------------------------------------------------------------------
    | PRODUCTS
    |--------------------------------------------------------------------------
    */

    $products = [];

    $product_query = new WP_Query([
        'post_type'              => 'product',
        'post_status'            => 'publish',
        'posts_per_page'         => -1,
        'no_found_rows'          => true,
        'update_post_meta_cache' => true,
        'update_post_term_cache' => true,
    ]);

    error_log(
        'BOOTSTRAP | PRODUCT QUERY: ' .
            round((microtime(true) - $start) * 1000, 2) .
            ' ms'
    );


    foreach ($product_query->posts as $post) {

        $products[] = inventory_transform_product($post);
    }


    error_log(
        'BOOTSTRAP | PRODUCT TRANSFORM: ' .
            round((microtime(true) - $start) * 1000, 2) .
            ' ms'
    );


    /*
    |--------------------------------------------------------------------------
    | PARTS
    |--------------------------------------------------------------------------
    */

    $parts = [];

    $part_terms = get_terms([
        'taxonomy'   => 'part',
        'hide_empty' => false,
    ]);

    if (!is_wp_error($part_terms)) {

        foreach ($part_terms as $term) {

            $parts[] = inventory_format_part(
                $term->term_id
            );
        }
    }


    error_log(
        'BOOTSTRAP | PARTS: ' .
            round((microtime(true) - $start) * 1000, 2) .
            ' ms'
    );


    /*
    |--------------------------------------------------------------------------
    | TAXONOMIES
    |--------------------------------------------------------------------------
    */

    $taxonomies = [
        'brand',
        'shelf',
        'condition',
        'inventory_category',
        'series',
    ];

    $taxonomy_data = [];


    foreach ($taxonomies as $taxonomy) {

        $terms = get_terms([
            'taxonomy'   => $taxonomy,
            'hide_empty' => false,
        ]);

        if (is_wp_error($terms)) {

            $taxonomy_data[$taxonomy] = [];

            continue;
        }


        $taxonomy_data[$taxonomy] = array_map(
            function ($term) use ($taxonomy) {

                $data = [
                    'id'   => $term->term_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                ];

                if ($taxonomy === 'condition') {
                    $data['price_percentage'] =
                        inventory_get_condition_price_percentage(
                            $term->slug
                        );
                }

                return $data;
            },
            $terms
        );
    }


    error_log(
        'BOOTSTRAP | TAXONOMIES: ' .
            round((microtime(true) - $start) * 1000, 2) .
            ' ms'
    );


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    $response = [
        'products'   => $products,
        'parts'      => $parts,

        'brands'     => $taxonomy_data['brand'] ?? [],
        'shelves'    => $taxonomy_data['shelf'] ?? [],
        'conditions' => $taxonomy_data['condition'] ?? [],
        'categories' => $taxonomy_data['inventory_category'] ?? [],
        'series'     => $taxonomy_data['series'] ?? [],
    ];


    /*
    |--------------------------------------------------------------------------
    | PERFORMANCE
    |--------------------------------------------------------------------------
    */

    $elapsed = (microtime(true) - $start) * 1000;

    error_log(
        '🔥 BOOTSTRAP TOTAL: ' .
            round($elapsed, 2) .
            ' ms'
    );

    error_log(
        '🔥 BOOTSTRAP PRODUCTS: ' .
            count($products)
    );

    error_log(
        '🔥 BOOTSTRAP PARTS: ' .
            count($parts)
    );

    error_log(
        '🔥 BOOTSTRAP RESPONSE SIZE: ' .
            strlen(wp_json_encode($response)) .
            ' bytes'
    );



    return rest_ensure_response($response);
}