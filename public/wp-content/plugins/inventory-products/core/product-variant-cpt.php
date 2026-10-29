<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register Product Variant records.
 *
 * Each record represents one unique Part + Condition combination.
 * These records are managed through the inventory React application,
 * not the standard WordPress admin interface.
 */
add_action('init', 'inventory_register_product_variant_cpt', 0);

function inventory_register_product_variant_cpt()
{
    register_post_type('product_variant', [
        'label'               => 'Product Variants',
        'public'              => false,
        'publicly_queryable'  => false,
        'exclude_from_search' => true,
        'show_ui'             => false,
        'show_in_menu'        => false,
        'show_in_rest'        => false,
        'has_archive'         => false,
        'rewrite'             => false,
        'supports'            => ['title'],
        'capability_type'     => 'post',
        'map_meta_cap'        => true,
    ]);
}