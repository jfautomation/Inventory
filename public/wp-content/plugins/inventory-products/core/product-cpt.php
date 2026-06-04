<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('init', 'inventory_register_product_cpt', 0);

function inventory_register_product_cpt()
{
    register_post_type('product', [
        'label' => 'Products',
        'public' => true,

        // REST API
        'show_in_rest' => true,
        'rest_base' => 'product',
        'rest_controller_class' => 'WP_REST_Posts_Controller',

        // Query behavior
        'publicly_queryable' => true,
        'has_archive' => true,

        // Admin support
        'supports' => ['title'],

        'menu_icon' => 'dashicons-products',

        // Capabilities
        'capability_type' => 'post',
        'map_meta_cap' => true,
    ]);
}