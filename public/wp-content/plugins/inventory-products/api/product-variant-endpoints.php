<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Check whether a SKU is already assigned to a variant.
 */
function inventory_variant_sku_exists($sku, $exclude_variant_id = 0)
{
    $args = [
        'post_type'      => 'product_variant',
        'post_status'    => 'any',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
        'meta_query'     => [
            [
                'key'     => '_inventory_variant_sku',
                'value'   => (string) $sku,
                'compare' => '=',
            ],
        ],
    ];

    if ($exclude_variant_id) {
        $args['post__not_in'] = [(int) $exclude_variant_id];
    }

    $query = new WP_Query($args);

    return !empty($query->posts);
}


/**
 * Generate a unique seven-digit numeric SKU.
 */
function inventory_variant_generate_sku()
{
    for ($attempt = 0; $attempt < 100; $attempt++) {
        $sku = (string) wp_rand(1000000, 9999999);

        if (!inventory_variant_sku_exists($sku)) {
            return $sku;
        }
    }

    return new WP_Error(
        'inventory_variant_sku_generation_failed',
        'A unique SKU could not be generated.',
        ['status' => 500]
    );
}


/**
 * Find the variant for a Part + Condition combination,
 * or create it if it does not exist.
 */
function inventory_variant_get_or_create($part_id, $condition_id)
{
    $part_id      = (int) $part_id;
    $condition_id = (int) $condition_id;

    if (!$part_id || !$condition_id) {
        return new WP_Error(
            'inventory_variant_invalid_terms',
            'A valid Part and Condition are required.',
            ['status' => 400]
        );
    }

    $part = get_term($part_id, 'part');
    $condition = get_term($condition_id, 'condition');

    if (
        !$part ||
        is_wp_error($part) ||
        !$condition ||
        is_wp_error($condition)
    ) {
        return new WP_Error(
            'inventory_variant_terms_not_found',
            'The selected Part or Condition could not be found.',
            ['status' => 400]
        );
    }

    // Find an existing variant for this exact combination.
    $query = new WP_Query([
        'post_type'      => 'product_variant',
        'post_status'    => 'any',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
        'meta_query'     => [
            'relation' => 'AND',
            [
                'key'     => '_inventory_variant_part_id',
                'value'   => (string) $part_id,
                'compare' => '=',
            ],
            [
                'key'     => '_inventory_variant_condition_id',
                'value'   => (string) $condition_id,
                'compare' => '=',
            ],
        ],
    ]);

    if (!empty($query->posts)) {
        return (int) $query->posts[0];
    }

    // Generate an SKU only when a new variant is required.
    $sku = inventory_variant_generate_sku();

    if (is_wp_error($sku)) {
        return $sku;
    }

    $variant_id = wp_insert_post(
        [
            'post_type'   => 'product_variant',
            'post_status' => 'publish',
            'post_title'  => $part->name . ' - ' . $condition->name,
        ],
        true
    );

    if (is_wp_error($variant_id)) {
        return $variant_id;
    }

    update_post_meta(
        $variant_id,
        '_inventory_variant_part_id',
        $part_id
    );

    update_post_meta(
        $variant_id,
        '_inventory_variant_condition_id',
        $condition_id
    );

    update_post_meta(
        $variant_id,
        '_inventory_variant_sku',
        $sku
    );

    return (int) $variant_id;
}


/**
 * Associate an inventory product with its Part + Condition variant.
 *
 * If the product's Part or Condition changes, its association is
 * changed accordingly. The old variant is intentionally retained.
 */
function inventory_variant_sync_product($product_id)
{
    $product_id = (int) $product_id;

    if (get_post_type($product_id) !== 'product') {
        return false;
    }

    $part_ids = wp_get_object_terms(
        $product_id,
        'part',
        ['fields' => 'ids']
    );

    $condition_ids = wp_get_object_terms(
        $product_id,
        'condition',
        ['fields' => 'ids']
    );

    if (is_wp_error($part_ids)) {
        return $part_ids;
    }

    if (is_wp_error($condition_ids)) {
        return $condition_ids;
    }

    // This product cannot be assigned to a variant until both
    // a Part and a Condition have been selected.
    if (empty($part_ids) || empty($condition_ids)) {
        delete_post_meta($product_id, '_inventory_variant_id');
        return false;
    }

    // Products are expected to have one Part and one Condition.
    $part_id      = (int) reset($part_ids);
    $condition_id = (int) reset($condition_ids);

    $variant_id = inventory_variant_get_or_create(
        $part_id,
        $condition_id
    );

    if (is_wp_error($variant_id)) {
        return $variant_id;
    }

    update_post_meta(
        $product_id,
        '_inventory_variant_id',
        $variant_id
    );

    return $variant_id;
}


/**
 * Run after the existing product REST save logic.
 *
 * Priority 20 allows the existing priority-10 save handler to run first.
 */
function inventory_variant_after_product_rest_save(
    $post,
    $request,
    $creating
) {
    if (!$post || is_wp_error($post)) {
        return;
    }

    inventory_variant_sync_product($post->ID);
}

add_action(
    'rest_after_insert_product',
    'inventory_variant_after_product_rest_save',
    20,
    3
);


/**
 * One-time association pass for inventory products already in WordPress.
 */
function inventory_variant_backfill_existing_products()
{
    if (get_option('inventory_variant_backfill_v1_complete')) {
        return true;
    }

    $query = new WP_Query([
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'orderby'        => 'ID',
        'order'          => 'ASC',
        'no_found_rows'  => true,
    ]);

    $had_error = false;

    foreach ($query->posts as $product_id) {
        $result = inventory_variant_sync_product($product_id);

        if (is_wp_error($result)) {
            $had_error = true;

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(
                    'Inventory variant sync failed for product ' .
                    (int) $product_id . ': ' .
                    $result->get_error_message()
                );
            }
        }
    }

    if (!$had_error) {
        update_option('inventory_variant_backfill_v1_complete', 1, false);
        return true;
    }

    return new WP_Error(
        'inventory_variant_backfill_incomplete',
        'Some existing products could not be associated with variants. Please retry the Stock Summary request.',
        ['status' => 500]
    );
}


/**
 * Calculate active quantity from associated, published inventory products.
 *
 * Quantity is calculated dynamically rather than stored on the variant.
 */
function inventory_variant_get_available_quantity($variant_id)
{
    $query = new WP_Query([
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'no_found_rows'  => false,
        'meta_query'     => [
            'relation' => 'AND',
            [
                'key'     => '_inventory_variant_id',
                'value'   => (string) (int) $variant_id,
                'compare' => '=',
            ],
            [
                'key'     => 'inventory_status',
                'value'   => 'active',
                'compare' => '=',
            ],
        ],
    ]);

    return (int) $query->found_posts;
}


/**
 * Return Stock Summary rows.
 */
function inventory_variant_get_stock_summary(WP_REST_Request $request)
{
    $backfill = inventory_variant_backfill_existing_products();

    if (is_wp_error($backfill)) {
        return $backfill;
    }

    $variants = new WP_Query([
        'post_type'      => 'product_variant',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'orderby'        => 'ID',
        'order'          => 'ASC',
        'no_found_rows'  => true,
    ]);

    $rows = [];

    foreach ($variants->posts as $variant) {
        $variant_id = (int) $variant->ID;

        $part_id = (int) get_post_meta(
            $variant_id,
            '_inventory_variant_part_id',
            true
        );

        $condition_id = (int) get_post_meta(
            $variant_id,
            '_inventory_variant_condition_id',
            true
        );

        $part = get_term($part_id, 'part');
        $condition = get_term($condition_id, 'condition');

        // Ignore variants whose related taxonomy terms no longer exist.
        if (
            !$part ||
            is_wp_error($part) ||
            !$condition ||
            is_wp_error($condition)
        ) {
            continue;
        }

        $rows[] = [
            'id'             => $variant_id,
            'part_id'        => $part_id,
            'part_name'      => $part->name,
            'condition_id'   => $condition_id,
            'condition_name' => $condition->name,
            'available_qty'  => inventory_variant_get_available_quantity(
                $variant_id
            ),
            'sku'            => (string) get_post_meta(
                $variant_id,
                '_inventory_variant_sku',
                true
            ),
        ];
    }

    // Sort by Part name, then Condition name.
    usort($rows, function ($a, $b) {
        $part_comparison = strcasecmp(
            $a['part_name'],
            $b['part_name']
        );

        if ($part_comparison !== 0) {
            return $part_comparison;
        }

        return strcasecmp(
            $a['condition_name'],
            $b['condition_name']
        );
    });

    return rest_ensure_response($rows);
}


/**
 * Update the SKU for a variant.
 * No other variant fields are editable through this endpoint.
 */
function inventory_variant_update_sku(WP_REST_Request $request)
{
    $variant_id = (int) $request['variant_id'];
    $variant = get_post($variant_id);

    if (!$variant || $variant->post_type !== 'product_variant') {
        return new WP_Error(
            'inventory_variant_not_found',
            'The requested variant was not found.',
            ['status' => 404]
        );
    }

    $sku = sanitize_text_field(
        (string) $request->get_param('sku')
    );

    // Keep the seven-digit numeric SKU format consistent.
    if (!preg_match('/^[0-9]{7}$/', $sku)) {
        return new WP_Error(
            'inventory_variant_invalid_sku',
            'SKU must contain exactly seven digits.',
            ['status' => 400]
        );
    }

    if (inventory_variant_sku_exists($sku, $variant_id)) {
        return new WP_Error(
            'inventory_variant_duplicate_sku',
            'That SKU is already assigned to another variant.',
            ['status' => 409]
        );
    }

    update_post_meta(
        $variant_id,
        '_inventory_variant_sku',
        $sku
    );

    return rest_ensure_response([
        'id'  => $variant_id,
        'sku' => $sku,
    ]);
}


/**
 * Register Stock Summary API routes.
 */
function inventory_register_variant_api_routes()
{
    register_rest_route('inventory/v1', '/stock-summary', [
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'inventory_variant_get_stock_summary',
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            },
        ],
    ]);

    register_rest_route(
        'inventory/v1',
        '/stock-summary/(?P<variant_id>\d+)/sku',
        [
            [
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => 'inventory_variant_update_sku',
                'permission_callback' => function () {
                    return current_user_can('edit_posts');
                },
                'args' => [
                    'sku' => [
                        'required' => true,
                        'type'     => 'string',
                    ],
                ],
            ],
        ]
    );
}

add_action(
    'rest_api_init',
    'inventory_register_variant_api_routes'
);