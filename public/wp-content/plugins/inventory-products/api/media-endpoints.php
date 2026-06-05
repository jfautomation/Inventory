<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {

    register_rest_route('inventory/v1', '/media', [
        'methods'  => 'POST',
        'permission_callback' => '__return_true',
        'callback' => 'inventory_upload_image',
    ]);
});

function inventory_upload_image($request)
{
    if (empty($_FILES['file'])) {
        return new WP_Error(
            'missing_file',
            'No file uploaded',
            ['status' => 400]
        );
    }

    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    $attachment_id = media_handle_upload('file', 0);

    if (is_wp_error($attachment_id)) {
        return $attachment_id;
    }

    return rest_ensure_response([
        'image_id' => $attachment_id,
        'url'      => wp_get_attachment_url($attachment_id),
    ]);
}