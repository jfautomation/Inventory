<?php

if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {

    register_rest_route('inventory/v1', '/part/(?P<id>\d+)/summary', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => 'inventory_get_part_summary',
    ]);

});

function inventory_get_part_summary($request)
{
    $part_id = (int) $request->get_param('id');

    if (!$part_id) {
        return new WP_Error('missing_part_id', 'Missing part id', ['status' => 400]);
    }

    $part = get_term($part_id, 'part');

    if (!$part || is_wp_error($part)) {
        return new WP_Error('invalid_part', 'Part not found', ['status' => 404]);
    }

    $by_condition = get_term_meta($part_id, 'part_stock', true);
    if (!is_array($by_condition)) $by_condition = [];

    $total_active = 0;
    foreach ($by_condition as $count) {
        $total_active += (int) $count;
    }

    return rest_ensure_response([
        'part' => [
            'id'   => $part->term_id,
            'name' => $part->name,
            'slug' => $part->slug,
        ],
        'total_active' => $total_active,
        'by_condition' => $by_condition,
    ]);
}