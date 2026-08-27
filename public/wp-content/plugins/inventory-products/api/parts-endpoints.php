<?php

if (!defined('ABSPATH')) {
    exit;
}

//////////////////////////////////////////////////////////
// PART API ROUTES
//////////////////////////////////////////////////////////

add_action('rest_api_init', function () {

    // ==================================================
    // GET + CREATE PARTS
    // ==================================================

    register_rest_route(
        'inventory/v1',
        '/parts',
        [
            // GET
            [
                'methods'  => WP_REST_Server::READABLE,
                'permission_callback' => '__return_true',
                'callback' => 'inventory_get_parts_by_brand',
            ],

            // POST
            [
                'methods'  => WP_REST_Server::CREATABLE,
                'permission_callback' => '__return_true',
                'callback' => 'inventory_create_part',
            ],
        ]
    );


    // ==================================================
    // UPDATE + DELETE PART
    //
    // PUT    /inventory/v1/parts/{id}
    // DELETE /inventory/v1/parts/{id}
    // ==================================================

    register_rest_route(
        'inventory/v1',
        '/parts/(?P<id>\d+)',
        [
            // PUT
            [
                'methods'  => WP_REST_Server::EDITABLE,
                'permission_callback' => '__return_true',
                'callback' => 'inventory_update_part',
            ],

            // DELETE
            [
                'methods'  => WP_REST_Server::DELETABLE,
                'permission_callback' => '__return_true',
                'callback' => 'inventory_delete_part',
            ],
        ]
    );

});


//////////////////////////////////////////////////////////
// CREATE PART
//////////////////////////////////////////////////////////

function inventory_create_part($request)
{
    $params = $request->get_json_params();


    // NAME
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


    // BRAND
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


    // CATEGORY
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


    // SERIES
    $series_id = isset($params['series_id'])
        ? (int) $params['series_id']
        : 0;


    // DUPLICATE CHECK
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


    // CREATE TERM
    $term = wp_insert_term(
        $name,
        'part'
    );

    if (is_wp_error($term)) {
        return $term;
    }

    $term_id = (int) $term['term_id'];


    // BRAND
    update_term_meta(
        $term_id,
        'brand_id',
        $brand_id
    );


    // CATEGORY
    update_term_meta(
        $term_id,
        'category_id',
        $category_id
    );


    // SERIES
    if ($series_id) {
        update_term_meta(
            $term_id,
            'series_id',
            $series_id
        );
    }


    // BASE PRICE
    $base_price = isset($params['base_price'])
        ? (float) $params['base_price']
        : 0;

    update_term_meta(
        $term_id,
        'base_price',
        $base_price
    );


    // DESCRIPTION
    $description = isset($params['description'])
        ? sanitize_textarea_field($params['description'])
        : '';

    update_term_meta(
        $term_id,
        'description',
        $description
    );


    // IMAGE
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


    // RESPONSE
    return rest_ensure_response(
        inventory_format_part($term_id)
    );
}


//////////////////////////////////////////////////////////
// UPDATE PART
//////////////////////////////////////////////////////////

function inventory_update_part($request)
{
    $term_id = (int) $request->get_param('id');

    if (!$term_id) {
        return new WP_Error(
            'invalid_part_id',
            'Invalid part ID.',
            ['status' => 400]
        );
    }


    // VERIFY PART EXISTS
    $term = get_term(
        $term_id,
        'part'
    );

    if (!$term || is_wp_error($term)) {
        return new WP_Error(
            'part_not_found',
            'Part not found.',
            ['status' => 404]
        );
    }


    $params = $request->get_json_params();


    // NAME
    $name = isset($params['name'])
        ? sanitize_text_field($params['name'])
        : $term->name;

    if ($name === '') {
        return new WP_Error(
            'missing_name',
            'Part name is required.',
            ['status' => 400]
        );
    }


    // BRAND
    $brand_id = isset($params['brand_id'])
        ? (int) $params['brand_id']
        : (int) get_term_meta(
            $term_id,
            'brand_id',
            true
        );

    if (!$brand_id) {
        return new WP_Error(
            'missing_brand',
            'Brand is required.',
            ['status' => 400]
        );
    }


    // CATEGORY
    $category_id = isset($params['category_id'])
        ? (int) $params['category_id']
        : (int) get_term_meta(
            $term_id,
            'category_id',
            true
        );

    if (!$category_id) {
        return new WP_Error(
            'missing_category',
            'Category is required.',
            ['status' => 400]
        );
    }


    // DUPLICATE CHECK
    $existing_parts = get_terms([
        'taxonomy'   => 'part',
        'hide_empty' => false,
        'name'       => $name,
    ]);

    if (!is_wp_error($existing_parts)) {

        foreach ($existing_parts as $existing_part) {

            if (
                (int) $existing_part->term_id ===
                $term_id
            ) {
                continue;
            }

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


    // UPDATE NAME
    if ($name !== $term->name) {

        $updated_term = wp_update_term(
            $term_id,
            'part',
            [
                'name' => $name,
            ]
        );

        if (is_wp_error($updated_term)) {
            return $updated_term;
        }
    }


    // BRAND
    update_term_meta(
        $term_id,
        'brand_id',
        $brand_id
    );


    // CATEGORY
    update_term_meta(
        $term_id,
        'category_id',
        $category_id
    );


    // SERIES
    if (isset($params['series_id'])) {

        $series_id = (int) $params['series_id'];

        if ($series_id) {

            update_term_meta(
                $term_id,
                'series_id',
                $series_id
            );

        } else {

            delete_term_meta(
                $term_id,
                'series_id'
            );
        }
    }


    // BASE PRICE
    if (isset($params['base_price'])) {

        update_term_meta(
            $term_id,
            'base_price',
            (float) $params['base_price']
        );
    }


    // DESCRIPTION
    if (isset($params['description'])) {

        update_term_meta(
            $term_id,
            'description',
            sanitize_textarea_field(
                $params['description']
            )
        );
    }


    // IMAGE
    if (isset($params['image_id'])) {

        $image_id = (int) $params['image_id'];

        if ($image_id) {

            update_term_meta(
                $term_id,
                'image_id',
                $image_id
            );

        } else {

            delete_term_meta(
                $term_id,
                'image_id'
            );
        }
    }


    // RESPONSE
    return rest_ensure_response(
        inventory_format_part($term_id)
    );
}


//////////////////////////////////////////////////////////
// DELETE PART
//////////////////////////////////////////////////////////

function inventory_delete_part($request)
{
    $term_id = (int) $request->get_param('id');

    if (!$term_id) {
        return new WP_Error(
            'invalid_part_id',
            'Invalid part ID.',
            ['status' => 400]
        );
    }


    // VERIFY PART EXISTS
    $term = get_term(
        $term_id,
        'part'
    );

    if (!$term || is_wp_error($term)) {
        return new WP_Error(
            'part_not_found',
            'Part not found.',
            ['status' => 404]
        );
    }


    // DELETE
    $deleted = wp_delete_term(
        $term_id,
        'part'
    );

    if (is_wp_error($deleted)) {
        return $deleted;
    }

    if (!$deleted) {
        return new WP_Error(
            'delete_failed',
            'Failed to delete part.',
            ['status' => 500]
        );
    }


    return rest_ensure_response([
        'success' => true,
        'id'      => $term_id,
        'message' => 'Part deleted successfully.',
    ]);
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

        if (
            $brand_id &&
            $part_brand_id !== $brand_id
        ) {
            continue;
        }

        $result[] = inventory_format_part(
            $part_id
        );
    }

    return rest_ensure_response(
        $result
    );
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