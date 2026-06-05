<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
register_rest_route('debug/v1', '/me', [
'methods' => 'GET',
'permission_callback' => '__return_true',
'callback' => function () {
return [
'user_id' => get_current_user_id(),
'can_upload' => current_user_can('upload_files'),
'roles' => wp_get_current_user()->roles,
];
}
]);
});