<?php

if (!defined('ABSPATH')) {
    exit;
}

error_log('🔥 parts-endpoints.php LOADED');

add_action('init', function () {
    error_log('GET EXISTS: ' . (function_exists('inventory_get_parts_by_brand') ? 'YES' : 'NO'));
    error_log('POST EXISTS: ' . (function_exists('inventory_create_part') ? 'YES' : 'NO'));
});

//////////////////////////////////////////////////////////
// ROUTES
//////////////////////////////////////////////////////////

add_action('rest_api_init', function () {

    register_rest_route('inventory/v1', '/parts', [
        [
            'methods'  => 'GET',
            'permission_callback' => '__return_true',
            'callback' => function ($request) {
                return inventory_get_parts_by_brand($request);
            },
        ],
        [
            'methods'  => 'POST',
            'permission_callback' => '__return_true',
            'callback' => function ($request) {
                return inventory_create_part($request);
            },
        ],
    ]);
});

//////////////////////////////////////////////////////////
// CREATE PART
//////////////////////////////////////////////////////////

function inventory_create_part($request)
{
    $params = $request->get_json_params();

    $name = isset($params['name'])
        ? sanitize_text_field($params['name'])
        : '';

    if (!$name) {
        return new WP_Error(
            'missing_name',
            'Part name is required',
            ['status' => 400]
        );
    }

    $term = wp_insert_term($name, 'part');

    if (is_wp_error($term)) {
        return $term;
    }

    $term_id = $term['term_id'];

    // BRAND LINK
    if (!empty($params['brand_id'])) {
        update_term_meta($term_id, 'brand_id', (int) $params['brand_id']);
    }

    // CATEGORY LINK
    if (!empty($params['category_id'])) {
        update_term_meta($term_id, 'category_id', (int) $params['category_id']);
    }

    // IMAGE LINK
    if (!empty($params['image_id'])) {
        update_term_meta($term_id, 'image_id', (int) $params['image_id']);
    }

    $created_term = get_term($term_id);
    $image_id = (int) get_term_meta($term_id, 'image_id', true);

    return [
        'id'        => $term_id,
        'name'      => $name,
        'slug'      => $created_term ? $created_term->slug : '',
        'image_id'  => $image_id,
        'image_url' => $image_id
            ? wp_get_attachment_image_url($image_id, 'medium')
            : null,
    ];
}

//////////////////////////////////////////////////////////
// GET PARTS
//////////////////////////////////////////////////////////

function inventory_get_parts_by_brand($request)
{
    $brand_id = (int) $request->get_param('brand_id');

    if (!$brand_id) {
        return rest_ensure_response([]);
    }

    $parts = get_terms([
        'taxonomy'   => 'part',
        'hide_empty' => false,
    ]);

    if (is_wp_error($parts)) {
        return rest_ensure_response([]);
    }

    $result = [];

    foreach ($parts as $part) {

        $part_id = $part->term_id;

        $part_brand_id = (int) get_term_meta($part_id, 'brand_id', true);

        if ($part_brand_id !== $brand_id) {
            continue;
        }

        $image_id = (int) get_term_meta($part_id, 'image_id', true);

        $result[] = [
            'id'        => $part_id,
            'name'      => $part->name,
            'slug'      => $part->slug,

            // image contract (frontend-safe)
            'image_id'  => $image_id,
            'image_url' => $image_id
                ? wp_get_attachment_image_url($image_id, 'medium')
                : null,
        ];
    }

    return rest_ensure_response($result);
}