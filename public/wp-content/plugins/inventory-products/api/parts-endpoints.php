<?php

if (!defined('ABSPATH')) {
    exit;
}

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

    // SERIES LINK
    if (!empty($params['series_id'])) {
        update_term_meta($term_id, 'series_id', (int) $params['series_id']);
    }

    // IMAGE LINK
    if (!empty($params['image_id'])) {
        update_term_meta($term_id, 'image_id', (int) $params['image_id']);
    }

    $created_term = get_term($term_id);
    $image_id = (int) get_term_meta($term_id, 'image_id', true);

    // BASE PRICE
    if (isset($params['base_price'])) {
        update_term_meta(
            $term_id,
            'base_price',
            sanitize_text_field($params['base_price'])
        );
    }

    // DESCRIPTION
    if (isset($params['description'])) {
        update_term_meta(
            $term_id,
            'description',
            sanitize_textarea_field($params['description'])
        );
    }

    return [
        'id'          => $term_id,
        'name'        => $name,
        'slug'        => $created_term ? $created_term->slug : '',

        'brand_id'    => get_term_meta($term_id, 'brand_id', true),
        'category_id' => get_term_meta($term_id, 'category_id', true),
        'series_id'   => get_term_meta($term_id, 'series_id', true),

        'base_price'  => get_term_meta($term_id, 'base_price', true),
        'description' => get_term_meta($term_id, 'description', true),

        'image_id'    => $image_id,
        'image_url'   => $image_id
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
    error_log("REQUEST BRAND FILTER: " . $brand_id);

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

        error_log(
            "PART {$part_id} BRAND: " .
                get_term_meta($part_id, 'brand_id', true)
        );

        error_log(
            "PART {$part_id} CATEGORY: " .
                get_term_meta($part_id, 'category_id', true)
        );

        $part_brand_id = (int) get_term_meta($part_id, 'brand_id', true);

        if ($brand_id && $part_brand_id !== $brand_id) {
            continue;
        }
        $image_id = (int) get_term_meta($part_id, 'image_id', true);

        $result[] = [
            'id'          => $part_id,
            'name'        => $part->name,
            'slug'        => $part->slug,

            'brand_id' => get_term_meta($part_id, 'brand_id', true),
            'category_id' => get_term_meta($part_id, 'category_id', true),
            'series_id'   => get_term_meta($part_id, 'series_id', true),

            'price_new' => (float) get_term_meta($part_id, 'base_price', true),
            'description' => get_term_meta($part_id, 'description', true),

            'image_id'    => $image_id,
            'image_url'   => $image_id
                ? wp_get_attachment_image_url($image_id, 'medium')
                : null,
        ];
    }

    return rest_ensure_response($result);
}