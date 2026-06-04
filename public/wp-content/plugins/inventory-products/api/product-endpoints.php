<?php

if (!defined('ABSPATH')) {
    exit;
}

//////////////////////////////////////////////////////////
// HELPERS (API-SAFE WRAPPER ONLY)
//////////////////////////////////////////////////////////

function inventory_meta_exists($meta_key, $meta_value, $exclude_post_id = 0)
{
    if (!$meta_value) return false;

    $args = [
        'post_type'      => 'product',
        'post_status'    => 'any',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'post__not_in'   => $exclude_post_id ? [$exclude_post_id] : [],
        'meta_query'     => [
            [
                'key'     => $meta_key,
                'value'   => $meta_value,
                'compare' => '='
            ]
        ]
    ];

    return (new WP_Query($args))->have_posts();
}

//////////////////////////////////////////////////////////
// TRANSFORM (API OUTPUT ONLY)
//////////////////////////////////////////////////////////

function inventory_transform_product($post)
{
    $data = [
        'id'    => $post->ID,
        'title' => get_the_title($post->ID) ?: "",
    ];

    $fields = [
        'serial_number',
        'work_order',
        'list_price',
        'notes',
        'test_date',
        'inventory_status',
    ];

    foreach ($fields as $field) {
        $value = get_post_meta($post->ID, $field, true);

        if ($field === 'inventory_status') {
            $data[$field] = $value ?: 'active';
        } else {
            $data[$field] = $value ?: "";
        }
    }

    $image_id = (int) get_post_meta($post->ID, 'image_id', true);

    $data['image_id'] = $image_id;
    $data['image']    = $image_id ? wp_get_attachment_url($image_id) : "";

    $data['description'] = $data['notes'];

    $status = $data['inventory_status'] ?? 'active';
    $data['quantity'] = ($status === 'active') ? 1 : 0;

    $data['test_status'] = (bool) get_post_meta($post->ID, 'test_status', true);

    $taxonomies = [
        'inventory_category',
        'brand',
        'part',
        'shelf',
        'series',
        'condition'
    ];

    foreach ($taxonomies as $tax) {

        $terms = wp_get_post_terms($post->ID, $tax);

        if (is_wp_error($terms)) {
            $data[$tax] = [];
            continue;
        }

        $data[$tax] = array_map(function ($term) {
            return [
                'id'   => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            ];
        }, $terms);
    }

    return $data;
}

//////////////////////////////////////////////////////////
// REST OUTPUT FILTER
//////////////////////////////////////////////////////////

add_filter('rest_prepare_product', function ($response, $post) {

    $response->data = array_merge(
        $response->data,
        inventory_transform_product($post)
    );

    return $response;

}, 10, 3);

//////////////////////////////////////////////////////////
// VALIDATION (USES DOMAIN RULES)
//////////////////////////////////////////////////////////

add_filter('rest_pre_insert_product', function ($prepared_post, $request) {

    $serial_number = trim((string) $request->get_param('serial_number'));
    $work_order    = trim((string) $request->get_param('work_order'));

    if (
        $serial_number &&
        inventory_meta_exists('serial_number', $serial_number)
    ) {
        return new WP_Error(
            'duplicate_serial_number',
            'Serial number already exists.',
            ['status' => 400]
        );
    }

    if (
        $work_order &&
        inventory_meta_exists('work_order', $work_order)
    ) {
        return new WP_Error(
            'duplicate_work_order',
            'Work order already exists.',
            ['status' => 400]
        );
    }

    return $prepared_post;

}, 10, 2);

//////////////////////////////////////////////////////////
// AFTER INSERT (ORCHESTRATION ONLY)
//////////////////////////////////////////////////////////

add_action('rest_after_insert_product', function ($post, $request, $creating) {

    /**
     * =========================
     * TITLE
     * =========================
     */
    $title = trim((string) $request->get_param('title'));

    if ($title !== '') {
        wp_update_post([
            'ID'         => $post->ID,
            'post_title' => sanitize_text_field($title),
        ]);
    }

    /**
     * =========================
     * META SAVE (RAW ONLY)
     * =========================
     */
    $meta_fields = [
        'serial_number',
        'work_order',
        'list_price',
        'notes',
        'test_status',
        'test_date',
        'inventory_status',
        'image_id'
    ];

    foreach ($meta_fields as $field) {
        $value = $request->get_param($field);

        if ($value !== null) {
            update_post_meta($post->ID, $field, $value);
        }
    }

    /**
     * =========================
     * STATUS (DOMAIN RULE)
     * =========================
     */
    $status = inventory_normalize_status(
        get_post_meta($post->ID, 'inventory_status', true)
    );

    update_post_meta($post->ID, 'inventory_status', $status);
    update_post_meta($post->ID, 'quantity', inventory_calculate_quantity($status));

    /**
     * =========================
     * PART → BRAND + CATEGORY (DOMAIN RULES)
     * =========================
     */
    $part_ids = $request->get_param('part');

    $brand_id = 0;
    $category_id = 0;

    if (is_array($part_ids) && !empty($part_ids[0])) {

        $part_id = (int) $part_ids[0];

        $brand_id    = inventory_get_brand_from_part($part_id);
        $category_id = inventory_get_category_from_part($part_id);

        if ($brand_id) {
            wp_set_post_terms($post->ID, [$brand_id], 'brand', false);
        }

        if ($category_id) {
            wp_set_post_terms($post->ID, [$category_id], 'inventory_category', false);
        }
    }

    /**
     * =========================
     * SERIES VALIDATION (DOMAIN RULE)
     * =========================
     */
    $series_ids = $request->get_param('series');

    if (is_array($series_ids)) {

        $series_ids = array_values(
            array_filter(array_map('intval', $series_ids))
        );

        $valid = [];

        foreach ($series_ids as $series_id) {

            if (inventory_is_series_allowed_for_brand($series_id, $brand_id)) {
                $valid[] = $series_id;
            }
        }

        wp_set_post_terms($post->ID, $valid, 'series', false);
    }

}, 10, 3);