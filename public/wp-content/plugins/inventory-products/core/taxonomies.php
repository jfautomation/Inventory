<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('init', 'inventory_register_taxonomies', 0);

function inventory_register_taxonomies()
{
    $taxonomies = [
        'inventory_category',
        'brand',
        'part',
        'shelf',
        'series',
        'condition',
    ];

    foreach ($taxonomies as $taxonomy) {

        register_taxonomy($taxonomy, ['product'], [
            'label' => ucwords(str_replace('_', ' ', $taxonomy)),

            // Public behavior
            'public'             => true,
            'publicly_queryable' => true,

            // REST API
            'show_in_rest'       => true,
            'rest_base'          => $taxonomy,

            // Structure
            'hierarchical'       => true,

            // Admin UI
            'show_ui'            => true,
            'show_admin_column'  => true,
            'show_in_menu'       => true,
        ]);
    }
}