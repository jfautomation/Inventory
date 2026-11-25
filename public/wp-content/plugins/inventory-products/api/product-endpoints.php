<?php

if (!defined('ABSPATH')) {
    exit;
}

error_log('PRODUCT-ENDPOINTS FILE LOADED');

//////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////

/**
 * Check whether a meta value already exists on another Product.
 */
function inventory_meta_exists($meta_key, $meta_value, $exclude_post_id = 0)
{
    if (!$meta_value) {
        return false;
    }

    $args = [
        'post_type'      => 'product',
        'post_status'    => 'any',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'post__not_in'   => $exclude_post_id ? [(int) $exclude_post_id] : [],
        'meta_query'     => [
            [
                'key'     => $meta_key,
                'value'   => $meta_value,
                'compare' => '=',
            ],
        ],
    ];

    return (new WP_Query($args))->have_posts();
}

/**
 * Validate that a Product Listing exists.
 */
function inventory_validate_product_listing($listing_id)
{
    $listing_id = absint($listing_id);

    if (!$listing_id) {
        return new WP_Error(
            'missing_product_listing',
            'A Product Listing is required.',
            ['status' => 400]
        );
    }

    $listing = get_post($listing_id);

    if (!$listing || $listing->post_type !== 'product_variant') {
        return new WP_Error(
            'invalid_product_listing',
            'The selected Product Listing does not exist.',
            ['status' => 400]
        );
    }

    if (!in_array($listing->post_status, ['publish', 'draft'], true)) {
        return new WP_Error(
            'invalid_product_listing_status',
            'The selected Product Listing is not available.',
            ['status' => 400]
        );
    }

    return $listing;
}

/**
 * Get the authoritative title from a Product Listing.
 */
function inventory_get_product_listing_title($listing_id)
{
    $listing = get_post(absint($listing_id));

    if (
        !$listing ||
        $listing->post_type !== 'product_variant'
    ) {
        return '';
    }

    return trim((string) $listing->post_title);
}

/**
 * Synchronize one serialized Product title from its Product Listing.
 *
 * Serialized Products do not have independently editable titles.
 */
function inventory_sync_product_title_from_listing($product_id, $listing_id = 0)
{
    $product_id = absint($product_id);

    if (!$product_id) {
        return false;
    }

    if (!$listing_id) {
        $listing_id = (int) get_post_meta(
            $product_id,
            '_inventory_variant_id',
            true
        );
    }

    $listing_title = inventory_get_product_listing_title($listing_id);

    if ($listing_title === '') {
        return false;
    }

    $product = get_post($product_id);

    if (
        !$product ||
        $product->post_type !== 'product'
    ) {
        return false;
    }

    if ($product->post_title === $listing_title) {
        return true;
    }

    $result = wp_update_post(
        [
            'ID'         => $product_id,
            'post_title' => $listing_title,
        ],
        true
    );

    if (is_wp_error($result)) {
        error_log(
            'Failed to synchronize Product title for Product ID ' .
            $product_id . ': ' . $result->get_error_message()
        );

        return false;
    }

    return true;
}

/**
 * Synchronize every serialized Product belonging to a Product Listing.
 *
 * This is called whenever a Product Listing title changes.
 */
function inventory_sync_listing_product_titles($listing_id)
{
    $listing_id = absint($listing_id);

    if (!$listing_id) {
        return;
    }

    $listing = get_post($listing_id);

    if (
        !$listing ||
        $listing->post_type !== 'product_variant'
    ) {
        return;
    }

    $product_query = new WP_Query(
        [
            'post_type'      => 'product',
            'post_status'    => 'any',
            'posts_per_page' => -1,
            'fields'         => 'ids',
            'meta_query'     => [
                [
                    'key'     => '_inventory_variant_id',
                    'value'   => $listing_id,
                    'compare' => '=',
                ],
            ],
        ]
    );

    foreach ($product_query->posts as $product_id) {
        inventory_sync_product_title_from_listing(
            $product_id,
            $listing_id
        );
    }
}

/**
 * Keep serialized Product titles synchronized when a Product Listing
 * is created or its title is updated.
 */
add_action(
    'save_post_product_variant',
    function ($listing_id, $post, $update) {

        if (
            wp_is_post_revision($listing_id) ||
            wp_is_post_autosave($listing_id)
        ) {
            return;
        }

        if (!$post || $post->post_type !== 'product_variant') {
            return;
        }

        inventory_sync_listing_product_titles($listing_id);

    },
    20,
    3
);

/**
 * Assign the Part and Condition belonging to a Product Listing
 * to its serialized Product.
 *
 * The Product Listing remains the authoritative relationship.
 */
function inventory_apply_product_listing_terms($product_id, $listing_id)
{
    $part_id = (int) get_post_meta(
        $listing_id,
        '_inventory_variant_part_id',
        true
    );

    $condition_id = (int) get_post_meta(
        $listing_id,
        '_inventory_variant_condition_id',
        true
    );

    if ($part_id) {
        wp_set_object_terms(
            $product_id,
            [$part_id],
            'part',
            false
        );

        $brand_id = inventory_get_brand_from_part($part_id);
        $category_id = inventory_get_category_from_part($part_id);

        if ($brand_id) {
            wp_set_object_terms(
                $product_id,
                [$brand_id],
                'brand',
                false
            );
        }

        if ($category_id) {
            wp_set_object_terms(
                $product_id,
                [$category_id],
                'inventory_category',
                false
            );
        }
    }

    if ($condition_id) {
        wp_set_object_terms(
            $product_id,
            [$condition_id],
            'condition',
            false
        );
    }

    return true;
}

//////////////////////////////////////////////////////////
// TRANSFORM
//////////////////////////////////////////////////////////

function inventory_transform_product($post)
{
    $product_id = (int) $post->ID;

    $listing_id = (int) get_post_meta(
        $product_id,
        '_inventory_variant_id',
        true
    );

    // The Product Listing is the authoritative title source.
    $listing_title = $listing_id
        ? inventory_get_product_listing_title($listing_id)
        : '';

    $data = [
        'id'                 => $product_id,
        'title'              => $listing_title ?: get_the_title($product_id) ?: '',
        'product_listing_id' => $listing_id,
    ];

    $fields = [
        'serial_number',
        'work_order',
        'list_price',



        
        'price_mode',
        'notes',
        'short_description',
        'long_description',
        'seo_title',
        'meta_description',
        'search_terms',
        'test_date',
        'inventory_status',
    ];

    foreach ($fields as $field) {
        $value = get_post_meta($product_id, $field, true);

        if ($field === 'inventory_status') {
            $data[$field] = $value ?: 'active';
        } elseif ($field === 'list_price') {
            $data[$field] = $value !== ''
                ? (float) $value
                : null;
        } else {
            $data[$field] = $value ?: '';
        }
    }

    $image_id = (int) get_post_meta(
        $product_id,
        'image_id',
        true
    );

    $data['image_id'] = $image_id;
    $data['image'] = $image_id
        ? wp_get_attachment_url($image_id)
        : '';

    $additional_image_ids = get_post_meta(
        $product_id,
        'additional_image_ids',
        true
    );

    if (!is_array($additional_image_ids)) {
        $additional_image_ids = [];
    }

    $additional_image_ids = array_values(
        array_filter(
            array_map('intval', $additional_image_ids)
        )
    );

    $data['additional_image_ids'] = $additional_image_ids;

    $data['additional_image_urls'] = array_values(
        array_filter(
            array_map(
                'wp_get_attachment_url',
                $additional_image_ids
            )
        )
    );

    $data['description'] = $data['notes'];

    $status = $data['inventory_status'] ?? 'active';

    $data['quantity'] = ($status === 'active') ? 1 : 0;

    $data['test_status'] = (bool) get_post_meta(
        $product_id,
        'test_status',
        true
    );

    $taxonomies = [
        'inventory_category',
        'brand',
        'part',
        'shelf',
        'condition',
    ];

    foreach ($taxonomies as $taxonomy) {
        $terms = wp_get_post_terms(
            $product_id,
            $taxonomy
        );

        if (is_wp_error($terms)) {
            $data[$taxonomy] = [];
            continue;
        }

        $data[$taxonomy] = array_map(function ($term) {
            return [
                'id'   => $term->term_id,
                'name' => html_entity_decode(
                    $term->name,
                    ENT_QUOTES | ENT_HTML5,
                    'UTF-8'
                ),
                'slug' => $term->slug,
            ];
        }, $terms);
    }

    return $data;
}

//////////////////////////////////////////////////////////
// REST OUTPUT FILTER
//////////////////////////////////////////////////////////

add_filter('rest_prepare_product', function ($response, $post, $request) {

    $response->data = array_merge(
        $response->data,
        inventory_transform_product($post)
    );

    return $response;

}, 10, 3);

//////////////////////////////////////////////////////////
// VALIDATION
//////////////////////////////////////////////////////////

add_filter('rest_pre_insert_product', function ($prepared_post, $request) {

    // Identify the existing Product when updating.
    $post_id = (int) $request->get_param('id');

    if (!$post_id && isset($prepared_post->ID)) {
        $post_id = (int) $prepared_post->ID;
    }

    $serial_number = trim(
        (string) $request->get_param('serial_number')
    );

    $work_order = trim(
        (string) $request->get_param('work_order')
    );

    /**
     * PRODUCT LISTING VALIDATION
     *
     * A new serialized Product must have a Product Listing.
     * An existing Product may retain its current listing
     * when the relationship is not being changed.
     */

    $listing_id = $request->get_param('product_listing_id');

    if ($listing_id !== null && $listing_id !== '') {

        $listing = inventory_validate_product_listing($listing_id);

        if (is_wp_error($listing)) {
            return $listing;
        }

    } elseif (!$post_id) {

        return new WP_Error(
            'missing_product_listing',
            'Select a Product Listing before creating a serialized Product.',
            ['status' => 400]
        );

    }

    /**
     * WORK ORDER UNIQUENESS
     */

    if (
        $work_order &&
        inventory_meta_exists(
            'work_order',
            $work_order,
            $post_id
        )
    ) {
        return new WP_Error(
            'duplicate_work_order',
            'Work order already exists.',
            ['status' => 400]
        );
    }

    /**
     * SERIAL NUMBER UNIQUENESS
     */

    if (
        $serial_number &&
        inventory_meta_exists(
            'serial_number',
            $serial_number,
            $post_id
        )
    ) {
        return new WP_Error(
            'duplicate_serial_number',
            'Serial number already exists.',
            ['status' => 400]
        );
    }

    return $prepared_post;

}, 10, 2);

//////////////////////////////////////////////////////////
// AFTER INSERT
//////////////////////////////////////////////////////////

add_action('rest_after_insert_product', function ($post, $request, $creating) {

    $product_id = (int) $post->ID;

    /**
     * PRODUCT LISTING RELATIONSHIP
     *
     * Save the explicitly selected Product Listing.
     */

    $requested_listing_id = $request->get_param(
        'product_listing_id'
    );

    if (
        $requested_listing_id !== null &&
        $requested_listing_id !== ''
    ) {
        $listing_id = absint($requested_listing_id);
    } else {
        // Preserve the existing relationship during updates
        // when the request does not supply a new listing ID.
        $listing_id = (int) get_post_meta(
            $product_id,
            '_inventory_variant_id',
            true
        );
    }

    if ($listing_id) {

        $listing = inventory_validate_product_listing(
            $listing_id
        );

        if (is_wp_error($listing)) {
            error_log(
                'Invalid Product Listing relationship for Product ' .
                $product_id
            );

            return;
        }

        update_post_meta(
            $product_id,
            '_inventory_variant_id',
            $listing_id
        );

        inventory_apply_product_listing_terms(
            $product_id,
            $listing_id
        );

        // Always inherit the title from the selected listing.
        inventory_sync_product_title_from_listing(
            $product_id,
            $listing_id
        );
    }

    /**
     * META SAVE
     *
     * Title is deliberately excluded.
     * Serialized Product titles are inherited from Product Listings.
     */

    $meta_fields = [
        'serial_number',
        'work_order',
        'notes',
        'short_description',
        'long_description',
        'seo_title',
        'meta_description',
        'search_terms',
        'test_status',
        'test_date',
        'inventory_status',
        'image_id',
        'additional_image_ids',
        'price_mode',
    ];

    foreach ($meta_fields as $field) {

        $value = $request->get_param($field);

        if ($field === 'image_id' && $value === null) {
            delete_post_meta($product_id, $field);
            continue;
        }

        if ($value !== null) {
            update_post_meta(
                $product_id,
                $field,
                $value
            );
        }
    }

    /**
     * STATUS
     */

    $status = inventory_normalize_status(
        get_post_meta(
            $product_id,
            'inventory_status',
            true
        )
    );

    update_post_meta(
        $product_id,
        'inventory_status',
        $status
    );

    update_post_meta(
        $product_id,
        'quantity',
        inventory_calculate_quantity($status)
    );

    /**
     * PART → BRAND + CATEGORY
     *
     * Retain the existing Part-based logic for compatibility.
     */

    $part_ids = $request->get_param('part');

    if (is_array($part_ids) && !empty($part_ids[0])) {

        $part_id = (int) $part_ids[0];

        $brand_id = inventory_get_brand_from_part($part_id);
        $category_id = inventory_get_category_from_part($part_id);

        if ($brand_id) {
            wp_set_post_terms(
                $product_id,
                [$brand_id],
                'brand',
                false
            );
        }

        if ($category_id) {
            wp_set_post_terms(
                $product_id,
                [$category_id],
                'inventory_category',
                false
            );
        }
    }

    /**
     * PRICING MODE
     *
     * Existing serialized Product pricing behavior is retained
     * for compatibility during the transition to listing-based
     * pricing.
     */

    $requested_price_mode = $request->get_param('price_mode');

    $existing_price_mode = get_post_meta(
        $product_id,
        'price_mode',
        true
    );

    if ($requested_price_mode !== null) {

        $price_mode = inventory_normalize_price_mode(
            $requested_price_mode
        );

    } elseif ($existing_price_mode !== '') {

        $price_mode = inventory_normalize_price_mode(
            $existing_price_mode
        );

    } else {

        $price_mode = 'automatic';

    }

    update_post_meta(
        $product_id,
        'price_mode',
        $price_mode
    );

    /**
     * GET PRODUCT PART
     */

    $product_parts = wp_get_post_terms(
        $product_id,
        'part'
    );

    $product_part_id = 0;

    if (
        !empty($product_parts) &&
        !is_wp_error($product_parts)
    ) {
        $product_part_id = (int) $product_parts[0]->term_id;
    }

    /**
     * GET PRODUCT CONDITION
     */

    $product_conditions = wp_get_post_terms(
        $product_id,
        'condition'
    );

    $product_condition_id = 0;

    if (
        !empty($product_conditions) &&
        !is_wp_error($product_conditions)
    ) {
        $product_condition_id = (int) $product_conditions[0]->term_id;
    }

    /**
     * AUTOMATIC PRICING
     */

    if ($price_mode === 'automatic') {

        $calculated_price = inventory_calculate_product_price(
            $product_part_id,
            $product_condition_id
        );

        if ($calculated_price !== null) {

            update_post_meta(
                $product_id,
                'list_price',
                $calculated_price
            );

        } else {

            delete_post_meta(
                $product_id,
                'list_price'
            );

        }
    }

    /**
     * MANUAL PRICING
     */

    if ($price_mode === 'manual') {

        $manual_price = $request->get_param('list_price');

        if ($manual_price !== null) {

            $manual_price = (float) $manual_price;

            if ($manual_price >= 0) {
                update_post_meta(
                    $product_id,
                    'list_price',
                    $manual_price
                );
            }
        }
    }

}, 10, 3);