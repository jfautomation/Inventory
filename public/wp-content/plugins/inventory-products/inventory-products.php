<?php
/*
Plugin Name: Inventory Products
Description: Headless inventory system (WordPress = API only, React = UI).
Version: 3.8
Author: Tatyana
*/

if (!defined('ABSPATH')) exit;

//////////////////////////////////////////////////////////
// CPT
//////////////////////////////////////////////////////////

add_action('init', function () {

    register_post_type('product', [
        'label' => 'Products',
        'public' => true,
        'show_in_rest' => true,

        'rest_base' => 'product',
        'rest_controller_class' => 'WP_REST_Posts_Controller',

        'publicly_queryable' => true,
        'has_archive' => true,

        'supports' => ['title'],

        'menu_icon' => 'dashicons-products',

        /*
        🔥 CRITICAL FIX:
        Use DEFAULT WP capabilities for REST compatibility
        */
        'capability_type' => 'post',
        'map_meta_cap' => true,
    ]);

});

//////////////////////////////////////////////////////////
// TAXONOMIES
//////////////////////////////////////////////////////////

add_action('init', function () {

    $taxonomies = ['brand', 'part', 'shelf', 'series'];

    foreach ($taxonomies as $tax) {
        register_taxonomy($tax, 'product', [
            'label' => ucfirst($tax) . 's',
            'public' => true,
            'show_in_rest' => true,
            'hierarchical' => false,
            'publicly_queryable' => true,
        ]);
    }

});

//////////////////////////////////////////////////////////
// META FIELDS
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
            'auth_callback' => '__return_true',
        ]);
    }

});

//////////////////////////////////////////////////////////
// TRANSFORMER
//////////////////////////////////////////////////////////

function inventory_transform_product($post) {

    $data = [];

    $data['id'] = $post->ID;
    $data['title'] = get_the_title($post->ID) ?: "";

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

    $taxonomies = ['brand', 'part', 'shelf', 'series'];

    foreach ($taxonomies as $tax) {
        $terms = wp_get_post_terms($post->ID, $tax);

        $data[$tax] = array_map(function ($term) {
            return [
                'id' => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            ];
        }, $terms);
    }

    return $data;
}

//////////////////////////////////////////////////////////
// REST OUTPUT OVERRIDE
//////////////////////////////////////////////////////////

add_filter('rest_prepare_product', function ($response, $post) {
    $response->data = inventory_transform_product($post);
    return $response;
}, 10, 3);

//////////////////////////////////////////////////////////
// CREATE / UPDATE HANDLER
//////////////////////////////////////////////////////////

add_action('rest_after_insert_product', function ($post, $request, $creating) {

    $meta_fields = [
        'serial_number',
        'work_order',
        'condition',
        'list_price',
        'notes',
        'test_status',
        'test_date'
    ];

    foreach ($meta_fields as $field) {
        $value = $request->get_param($field);

        if ($value !== null) {
            update_post_meta($post->ID, $field, $value);
        }
    }

    $taxonomies = ['brand', 'part', 'shelf', 'series'];

    foreach ($taxonomies as $tax) {
        $terms = $request->get_param($tax);

        if (is_array($terms)) {
            wp_set_post_terms($post->ID, $terms, $tax);
        }
    }

}, 10, 3);

//////////////////////////////////////////////////////////
// CORS (DEV ONLY)
//////////////////////////////////////////////////////////

add_action('rest_api_init', function () {

    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

    add_filter('rest_pre_serve_request', function ($value) {

        header('Access-Control-Allow-Origin: http://localhost:3000');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');

        return $value;
    });

});

//////////////////////////////////////////////////////////
// NONCE ENDPOINT (OPTIONAL DEBUG)
//////////////////////////////////////////////////////////

add_action('rest_api_init', function () {

    register_rest_route('inventory/v1', '/nonce', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            return [
                'nonce' => wp_create_nonce('wp_rest')
            ];
        }
    ]);

});

//////////////////////////////////////////////////////////
// DEBUG AUTH ENDPOINT
//////////////////////////////////////////////////////////

add_action('rest_api_init', function () {

    register_rest_route('debug/v1', '/auth', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {

            return [
                'auth_header' => $_SERVER['HTTP_AUTHORIZATION'] ?? null,
                'php_auth_user' => $_SERVER['PHP_AUTH_USER'] ?? null,
                'php_auth_pw' => $_SERVER['PHP_AUTH_PW'] ?? null,
                'user' => wp_get_current_user()->user_login ?? null,
                'logged_in' => is_user_logged_in(),
            ];
        }
    ]);

});
