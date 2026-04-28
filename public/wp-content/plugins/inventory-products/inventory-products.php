<?php
/*
Plugin Name: Inventory Products
Description: Clean inventory system with REST support for React.
Version: 2.0
Author: Tatyana
*/

if (!defined('ABSPATH')) exit;

//////////////////////////////////////////////////////////
// REGISTER POST TYPE
//////////////////////////////////////////////////////////

add_action('init', function () {

    register_post_type('product', [
        'label' => 'Products',
        'public' => true,
        'show_in_rest' => true,
        'supports' => ['title'],
        'menu_icon' => 'dashicons-products',
    ]);

});

//////////////////////////////////////////////////////////
// REGISTER TAXONOMIES
//////////////////////////////////////////////////////////

add_action('init', function () {

    $taxonomies = ['brand', 'part', 'shelf', 'series'];

    foreach ($taxonomies as $tax) {
        register_taxonomy($tax, 'product', [
            'label' => ucfirst($tax) . 's',
            'public' => true,
            'show_in_rest' => true,
            'hierarchical' => false,
        ]);
    }

});

//////////////////////////////////////////////////////////
// REGISTER META (CRITICAL FOR REST)
//////////////////////////////////////////////////////////

add_action('init', function () {

    $fields = [
        'serial_number',
        'work_order',
        'condition',
        'list_price',
        'notes',
        'test_status',
        'test_date'
    ];

    foreach ($fields as $key) {
        register_post_meta('product', $key, [
            'single' => true,
            'type' => $key === 'test_status' ? 'boolean' : 'string',
            'show_in_rest' => true,

            // 🔥 THIS FIXES YOUR ENTIRE ISSUE
            'auth_callback' => '__return_true',
        ]);
    }

});



//////////////////////////////////////////////////////////
// RETURN CLEAN DATA TO REACT
//////////////////////////////////////////////////////////

add_filter('rest_prepare_product', function ($response, $post) {

    $data = $response->data;

    $fields = [
        'serial_number',
        'work_order',
        'condition',
        'list_price',
        'notes',
        'test_status',
        'test_date'
    ];

    foreach ($fields as $field) {
        $value = get_post_meta($post->ID, $field, true);

        $data[$field] = ($field === 'test_status')
            ? filter_var($value, FILTER_VALIDATE_BOOLEAN)
            : ($value ?: "");
    }

    // TAXONOMIES → ALWAYS RETURN IDS
    $taxonomies = ['brand', 'part', 'shelf', 'series'];

    foreach ($taxonomies as $tax) {
        $data[$tax] = wp_get_post_terms($post->ID, $tax, ['fields' => 'ids']);
    }

    $response->data = $data;

    return $response;

}, 10, 3);