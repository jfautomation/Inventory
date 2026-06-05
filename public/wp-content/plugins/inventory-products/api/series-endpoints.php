<?php

if (!defined('ABSPATH')) {
    exit;
}

//////////////////////////////////////////////////////////
// SERIES ENDPOINTS
//////////////////////////////////////////////////////////

add_action('rest_api_init', function () {

    register_rest_route('inventory/v1', '/series', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => 'inventory_get_series_by_brand',
    ]);
});

//////////////////////////////////////////////////////////
// GET SERIES BY BRAND
//////////////////////////////////////////////////////////

function inventory_get_series_by_brand($request)
{
    $brand_id = absint($request->get_param('brand_id'));

    if (!$brand_id) {
        return rest_ensure_response([]);
    }

    $series_terms = get_terms([
        'taxonomy'   => 'series',
        'hide_empty' => false,
    ]);

    if (is_wp_error($series_terms) || empty($series_terms)) {
        return rest_ensure_response([]);
    }

    $result = [];

    foreach ($series_terms as $series) {

        // ✅ DOMAIN RULE USED HERE (single source of truth)
        if (!inventory_is_series_allowed_for_brand($series->term_id, $brand_id)) {
            continue;
        }

        $result[] = [
            'id'       => $series->term_id,
            'name'     => $series->name,
            'slug'     => $series->slug,
            'brand_id' => (int) get_term_meta($series->term_id, 'brand_id', true) ?: null,
        ];
    }

    return rest_ensure_response($result);
}