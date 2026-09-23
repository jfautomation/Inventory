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


    // PART NUMBER
    $part_number = isset($params['part_number'])
        ? trim(
            sanitize_text_field(
                $params['part_number']
            )
        )
        : '';

    if ($part_number === '') {
        return new WP_Error(
            'missing_part_number',
            'Part Number is required.',
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
    $series_id = isset($params['series_id']) &&
        $params['series_id'] !== null
        ? (int) $params['series_id']
        : 0;


    // DUPLICATE PART NUMBER CHECK
    $existing_part_numbers = get_terms([
        'taxonomy'   => 'part',
        'hide_empty' => false,
        'meta_query' => [
            [
                'key'     => 'part_number',
                'value'   => $part_number,
                'compare' => '=',
            ],
        ],
    ]);

    if (
        !is_wp_error($existing_part_numbers) &&
        !empty($existing_part_numbers)
    ) {
        return new WP_Error(
            'duplicate_part_number',
            'A part with this Part Number already exists.',
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
    } else {

        delete_term_meta(
            $term_id,
            'series_id'
        );
    }


    // BASE PRICE
    if (
        array_key_exists('base_price', $params) &&
        $params['base_price'] !== null &&
        $params['base_price'] !== ''
    ) {

        update_term_meta(
            $term_id,
            'base_price',
            (float) $params['base_price']
        );
    } else {

        delete_term_meta(
            $term_id,
            'base_price'
        );
    }


    // PART NUMBER
    update_term_meta(
        $term_id,
        'part_number',
        $part_number
    );


    // SHORT DESCRIPTION
    $short_description =
        array_key_exists(
            'short_description',
            $params
        ) &&
        $params['short_description'] !== null
        ? sanitize_textarea_field(
            $params['short_description']
        )
        : '';

    update_term_meta(
        $term_id,
        'short_description',
        $short_description
    );


    // LONG DESCRIPTION
    $long_description =
        array_key_exists(
            'long_description',
            $params
        ) &&
        $params['long_description'] !== null
        ? sanitize_textarea_field(
            $params['long_description']
        )
        : (
            isset($params['description'])
            ? sanitize_textarea_field(
                $params['description']
            )
            : ''
        );

    update_term_meta(
        $term_id,
        'long_description',
        $long_description
    );


    // LEGACY DESCRIPTION
    update_term_meta(
        $term_id,
        'description',
        $long_description
    );


    // IMAGE
    if (
        array_key_exists('image_id', $params) &&
        $params['image_id'] !== null &&
        $params['image_id'] !== ''
    ) {

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
    } else {

        delete_term_meta(
            $term_id,
            'image_id'
        );
    }


    // ADDITIONAL IMAGES
    $additional_image_ids =
        array_key_exists(
            'additional_image_ids',
            $params
        ) &&
        is_array($params['additional_image_ids'])
        ? array_values(
            array_filter(
                array_map(
                    'absint',
                    $params['additional_image_ids']
                )
            )
        )
        : [];

    update_term_meta(
        $term_id,
        'additional_image_ids',
        $additional_image_ids
    );


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


    // PART NUMBER
    $part_number = array_key_exists(
        'part_number',
        $params
    )
        ? trim(
            sanitize_text_field(
                $params['part_number']
            )
        )
        : trim(
            sanitize_text_field(
                get_term_meta(
                    $term_id,
                    'part_number',
                    true
                )
            )
        );

    if ($part_number === '') {
        return new WP_Error(
            'missing_part_number',
            'Part Number is required.',
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


    // DUPLICATE PART NUMBER CHECK
    $existing_part_numbers = get_terms([
        'taxonomy'   => 'part',
        'hide_empty' => false,
        'meta_query' => [
            [
                'key'     => 'part_number',
                'value'   => $part_number,
                'compare' => '=',
            ],
        ],
    ]);

    if (!is_wp_error($existing_part_numbers)) {

        foreach ($existing_part_numbers as $existing_part) {

            if (
                (int) $existing_part->term_id ===
                $term_id
            ) {
                continue;
            }

            return new WP_Error(
                'duplicate_part_number',
                'A part with this Part Number already exists.',
                ['status' => 400]
            );
        }
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
    if (array_key_exists('series_id', $params)) {

        if ($params['series_id'] === null) {

            delete_term_meta(
                $term_id,
                'series_id'
            );
        } else {

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
    }


    // BASE PRICE
    if (array_key_exists('base_price', $params)) {

        if (
            $params['base_price'] === null ||
            $params['base_price'] === ''
        ) {

            delete_term_meta(
                $term_id,
                'base_price'
            );
        } else {

            update_term_meta(
                $term_id,
                'base_price',
                (float) $params['base_price']
            );
        }
    }


    // PART NUMBER
    if (array_key_exists('part_number', $params)) {

        update_term_meta(
            $term_id,
            'part_number',
            $part_number
        );
    }


    // SHORT DESCRIPTION
    if (array_key_exists('short_description', $params)) {

        $short_description =
            $params['short_description'] !== null
            ? sanitize_textarea_field(
                $params['short_description']
            )
            : '';

        update_term_meta(
            $term_id,
            'short_description',
            $short_description
        );
    }


    // LONG DESCRIPTION
    if (array_key_exists('long_description', $params)) {

        $long_description =
            $params['long_description'] !== null
            ? sanitize_textarea_field(
                $params['long_description']
            )
            : '';

        update_term_meta(
            $term_id,
            'long_description',
            $long_description
        );

        update_term_meta(
            $term_id,
            'description',
            $long_description
        );
    } elseif (array_key_exists('description', $params)) {

        $description =
            $params['description'] !== null
            ? sanitize_textarea_field(
                $params['description']
            )
            : '';

        update_term_meta(
            $term_id,
            'long_description',
            $description
        );

        update_term_meta(
            $term_id,
            'description',
            $description
        );
    }


    // IMAGE
    if (array_key_exists('image_id', $params)) {

        if (
            $params['image_id'] === null ||
            $params['image_id'] === ''
        ) {

            delete_term_meta(
                $term_id,
                'image_id'
            );
        } else {

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
    }


    // ADDITIONAL IMAGES
    if (array_key_exists('additional_image_ids', $params)) {

        if (
            $params['additional_image_ids'] === null ||
            !is_array($params['additional_image_ids'])
        ) {

            delete_term_meta(
                $term_id,
                'additional_image_ids'
            );
        } else {

            $additional_image_ids =
                array_values(
                    array_filter(
                        array_map(
                            'absint',
                            $params['additional_image_ids']
                        )
                    )
                );

            if (empty($additional_image_ids)) {

                delete_term_meta(
                    $term_id,
                    'additional_image_ids'
                );
            } else {

                update_term_meta(
                    $term_id,
                    'additional_image_ids',
                    $additional_image_ids
                );
            }
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

    $base_price = get_term_meta(
        $term_id,
        'base_price',
        true
    );

    $base_price = $base_price !== ''
        ? (float) $base_price
        : null;

    $part_number = get_term_meta(
        $term_id,
        'part_number',
        true
    );

    $short_description = get_term_meta(
        $term_id,
        'short_description',
        true
    );

    $long_description = get_term_meta(
        $term_id,
        'long_description',
        true
    );

    $description = get_term_meta(
        $term_id,
        'description',
        true
    );

    $additional_image_ids = get_term_meta(
        $term_id,
        'additional_image_ids',
        true
    );

    $additional_image_ids =
        is_array($additional_image_ids)
        ? array_map(
            'absint',
            $additional_image_ids
        )
        : [];

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

        'series_id' => $series_id
            ? $series_id
            : null,

        'base_price' => $base_price,

        'description' => $description ?: '',

        'part_number' => $part_number ?: '',

        'short_description' => $short_description ?: '',

        'long_description' => $long_description ?: '',

        'image_id' => $image_id,

        'image_url' => $image_id
            ? wp_get_attachment_image_url(
                $image_id,
                'medium'
            )
            : null,

        'additional_image_urls' => array_values(
            array_filter(
                array_map(
                    function ($image_id) {
                        return wp_get_attachment_image_url(
                            $image_id,
                            'medium'
                        );
                    },
                    $additional_image_ids
                )
            )
        ),

        'additional_image_ids' => $additional_image_ids,
    ];
}