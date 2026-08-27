<?php

if (!defined('ABSPATH')) {
    exit;
}

//////////////////////////////////////////////////////////
// PART API ROUTES
//////////////////////////////////////////////////////////

add_action('rest_api_init', function () {

    register_rest_route('inventory/v1', '/parts', [

        // ==================================================
        // GET PARTS
        // ==================================================

        [
            'methods'  => WP_REST_Server::READABLE,

            // TEMPORARY — development only.
            'permission_callback' => '__return_true',

            'callback' => 'inventory_get_parts_by_brand',
        ],

        // ==================================================
        // CREATE PART
        // ==================================================

        [
            'methods'  => WP_REST_Server::CREATABLE,

            // TEMPORARY — development only.
            'permission_callback' => '__return_true',

            'callback' => 'inventory_create_part',
        ],

    ]);

});


//////////////////////////////////////////////////////////
// CREATE PART
//////////////////////////////////////////////////////////

function inventory_create_part($request)
{
    $params = $request->get_json_params();

    ////////////////////////////////////////////////////////
    // NAME
    ////////////////////////////////////////////////////////

    $name = isset($params['name'])
        ? sanitize_text_field($params['name'])
        : '';

    if ($name === '') {
        return new WP_Error(
            'missing_name',
            'Part name is required.',
            ['status' => 400]
        );
    }


    ////////////////////////////////////////////////////////
    // BRAND
    ////////////////////////////////////////////////////////

    $brand_id = isset($params['brand_id'])
        ? (int) $params['brand_id']
        : 0;

    if (!$brand_id) {
        return new WP_Error(
            'missing_brand',
            'Brand is required.',
            ['status' => 400]
        );
    }


    ////////////////////////////////////////////////////////
    // CATEGORY
    ////////////////////////////////////////////////////////

    $category_id = isset($params['category_id'])
        ? (int) $params['category_id']
        : 0;

    if (!$category_id) {
        return new WP_Error(
            'missing_category',
            'Category is required.',
            ['status' => 400]
        );
    }


    ////////////////////////////////////////////////////////
    // SERIES
    ////////////////////////////////////////////////////////

    $series_id = isset($params['series_id'])
        ? (int) $params['series_id']
        : 0;


    ////////////////////////////////////////////////////////
    // DUPLICATE CHECK
    //
    // Same part name is allowed under different brands.
    ////////////////////////////////////////////////////////

    $existing_parts = get_terms([
        'taxonomy'   => 'part',
        'hide_empty' => false,
        'name'       => $name,
    ]);

    if (!is_wp_error($existing_parts)) {

        foreach ($existing_parts as $existing_part) {

            $existing_brand_id = (int) get_term_meta(
                $existing_part->term_id,
                'brand_id',
                true
            );

            if ($existing_brand_id === $brand_id) {
                return new WP_Error(
                    'duplicate_part',
                    'A part with this name already exists for this brand.',
                    ['status' => 400]
                );
            }
        }
    }


    ////////////////////////////////////////////////////////
    // CREATE TERM
    ////////////////////////////////////////////////////////

    $term = wp_insert_term(
        $name,
        'part'
    );

    if (is_wp_error($term)) {
        return $term;
    }

    $term_id = (int) $term['term_id'];


    ////////////////////////////////////////////////////////
    // BRAND
    ////////////////////////////////////////////////////////

    update_term_meta(
        $term_id,
        'brand_id',
        $brand_id
    );


    ////////////////////////////////////////////////////////
    // CATEGORY
    ////////////////////////////////////////////////////////

    update_term_meta(
        $term_id,
        'category_id',
        $category_id
    );


    ////////////////////////////////////////////////////////
    // SERIES
    ////////////////////////////////////////////////////////

    if ($series_id) {
        update_term_meta(
            $term_id,
            'series_id',
            $series_id
        );
    }


    ////////////////////////////////////////////////////////
    // BASE PRICE
    ////////////////////////////////////////////////////////

    $base_price = isset($params['base_price'])
        ? (float) $params['base_price']
        : 0;

    update_term_meta(
        $term_id,
        'base_price',
        $base_price
    );


    ////////////////////////////////////////////////////////
    // DESCRIPTION
    ////////////////////////////////////////////////////////

    $description = isset($params['description'])
        ? sanitize_textarea_field($params['description'])
        : '';

    update_term_meta(
        $term_id,
        'description',
        $description
    );


    ////////////////////////////////////////////////////////
    // IMAGE
    ////////////////////////////////////////////////////////

    $image_id = isset($params['image_id'])
        ? (int) $params['image_id']
        : 0;

    if ($image_id) {
        update_term_meta(
            $term_id,
            'image_id',
            $image_id
        );
    }


    ////////////////////////////////////////////////////////
    // RESPONSE
    ////////////////////////////////////////////////////////

    return rest_ensure_response(
        inventory_format_part($term_id)
    );
}


//////////////////////////////////////////////////////////
// GET PARTS
//////////////////////////////////////////////////////////

function inventory_get_parts_by_brand($request)
{
    $brand_id = (int) $request->get_param('brand_id');

    $parts = get_terms([
        'taxonomy'   => 'part',
        'hide_empty' => false,
    ]);

    if (is_wp_error($parts)) {
        return rest_ensure_response([]);
    }

    $result = [];

    foreach ($parts as $part) {

        $part_id = (int) $part->term_id;

        $part_brand_id = (int) get_term_meta(
            $part_id,
            'brand_id',
            true
        );

        //////////////////////////////////////////////////////
        // BRAND FILTER
        //////////////////////////////////////////////////////

        if (
            $brand_id &&
            $part_brand_id !== $brand_id
        ) {
            continue;
        }

        $result[] = inventory_format_part($part_id);
    }

    return rest_ensure_response($result);
}


//////////////////////////////////////////////////////////
// FORMAT PART
//////////////////////////////////////////////////////////

function inventory_format_part($term_id)
{
    $term = get_term(
        $term_id,
        'part'
    );

    if (!$term || is_wp_error($term)) {
        return [];
    }

    $brand_id = (int) get_term_meta(
        $term_id,
        'brand_id',
        true
    );

    $category_id = (int) get_term_meta(
        $term_id,
        'category_id',
        true
    );

    $series_id = (int) get_term_meta(
        $term_id,
        'series_id',
        true
    );

    $base_price = (float) get_term_meta(
        $term_id,
        'base_price',
        true
    );

    $description = get_term_meta(
        $term_id,
        'description',
        true
    );

    $image_id = (int) get_term_meta(
        $term_id,
        'image_id',
        true
    );

    return [
        'id' => (int) $term->term_id,

        'name' => $term->name,

        'slug' => $term->slug,

        'brand_id' => $brand_id,

        'category_id' => $category_id,

        'series_id' => $series_id,

        'base_price' => $base_price,

        'description' => $description ?: '',

        'image_id' => $image_id,

        'image_url' => $image_id
            ? wp_get_attachment_image_url(
                $image_id,
                'medium'
            )
            : null,
    ];
}