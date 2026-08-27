<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {

    register_rest_route('inventory/v1', '/taxonomies', [
        'methods'             => 'GET',
        'permission_callback' => '__return_true',
        'callback'            => 'inventory_get_taxonomies',
    ]);

});

function inventory_get_taxonomies($request)
{
    $taxonomy_names = [
        'brand',
        'shelf',
        'condition',
        'inventory_category',
        'series',
    ];

    $result = [];

    foreach ($taxonomy_names as $taxonomy) {

        $terms = get_terms([
            'taxonomy'   => $taxonomy,
            'hide_empty' => false,
        ]);

        if (is_wp_error($terms)) {
            $result[$taxonomy] = [];
            continue;
        }

        $result[$taxonomy] = array_map(function ($term) {

            return [
                'id'   => (int) $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            ];

        }, $terms);
    }

    return rest_ensure_response($result);
}