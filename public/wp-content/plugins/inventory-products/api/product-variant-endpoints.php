<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Generate the official Product Listing title from its Part and Condition.
 *
 * The Part name is the master name.
 * The Condition is appended automatically.
 */
function inventory_variant_build_listing_title($part_id, $condition_id)
{
    $part = get_term((int) $part_id, 'part');
    $condition = get_term((int) $condition_id, 'condition');

    if (
        !$part ||
        is_wp_error($part) ||
        !$condition ||
        is_wp_error($condition)
    ) {
        return new WP_Error(
            'inventory_variant_title_terms_not_found',
            'The Part or Condition required to generate the Product Listing title could not be found.',
            ['status' => 400]
        );
    }

    return $part->name . ' - ' . $condition->name;
}

/**
 * Synchronize a Product Listing title with its Part and Condition.
 */
function inventory_variant_sync_listing_title($variant_id)
{
    $variant_id = (int) $variant_id;
    $variant = get_post($variant_id);

    if (!$variant || $variant->post_type !== 'product_variant') {
        return false;
    }

    $part_id = (int) get_post_meta(
        $variant_id,
        '_inventory_variant_part_id',
        true
    );

    $condition_id = (int) get_post_meta(
        $variant_id,
        '_inventory_variant_condition_id',
        true
    );

    $title = inventory_variant_build_listing_title(
        $part_id,
        $condition_id
    );

    if (is_wp_error($title)) {
        return $title;
    }

    if ($variant->post_title !== $title) {
        $updated = wp_update_post(
            [
                'ID'         => $variant_id,
                'post_title' => $title,
            ],
            true
        );

        if (is_wp_error($updated)) {
            return $updated;
        }
    }

    return $title;
}

/**
 * Update all Product Listing titles associated with a renamed Part.
 */
function inventory_variant_after_part_edited($term_id, $tt_id, $args)
{
    $query = new WP_Query([
        'post_type'      => 'product_variant',
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
        'meta_query'     => [
            [
                'key'     => '_inventory_variant_part_id',
                'value'   => (string) (int) $term_id,
                'compare' => '=',
            ],
        ],
    ]);

    foreach ($query->posts as $variant_id) {
        inventory_variant_sync_listing_title($variant_id);
    }
}

add_action(
    'edited_part',
    'inventory_variant_after_part_edited',
    10,
    3
);

/**
 * Update all Product Listing titles associated with a renamed Condition.
 */
function inventory_variant_after_condition_edited($term_id, $tt_id, $args)
{
    $query = new WP_Query([
        'post_type'      => 'product_variant',
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
        'meta_query'     => [
            [
                'key'     => '_inventory_variant_condition_id',
                'value'   => (string) (int) $term_id,
                'compare' => '=',
            ],
        ],
    ]);

    foreach ($query->posts as $variant_id) {
        inventory_variant_sync_listing_title($variant_id);
    }
}

add_action(
    'edited_condition',
    'inventory_variant_after_condition_edited',
    10,
    3
);

/**
 * Check whether a SKU is already assigned to a Product Listing.
 */
function inventory_variant_sku_exists($sku, $exclude_variant_id = 0)
{
    $args = [
        'post_type'      => 'product_variant',
        'post_status'    => 'any',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
        'meta_query'     => [
            [
                'key'     => '_inventory_variant_sku',
                'value'   => (string) $sku,
                'compare' => '=',
            ],
        ],
    ];

    if ($exclude_variant_id) {
        $args['post__not_in'] = [(int) $exclude_variant_id];
    }

    $query = new WP_Query($args);

    return !empty($query->posts);
}

/**
 * Generate a unique seven-digit numeric SKU.
 */
function inventory_variant_generate_sku()
{
    for ($attempt = 0; $attempt < 100; $attempt++) {
        $sku = (string) wp_rand(1000000, 9999999);

        if (!inventory_variant_sku_exists($sku)) {
            return $sku;
        }
    }

    return new WP_Error(
        'inventory_variant_sku_generation_failed',
        'A unique SKU could not be generated.',
        ['status' => 500]
    );
}

/**
 * Find an existing Product Listing for a Part + Condition combination.
 *
 * Returns the listing ID or zero when none exists.
 */
function inventory_variant_find_listing($part_id, $condition_id)
{
    $query = new WP_Query([
        'post_type'      => 'product_variant',
        'post_status'    => 'any',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'no_found_rows'  => true,
        'meta_query'     => [
            'relation' => 'AND',
            [
                'key'     => '_inventory_variant_part_id',
                'value'   => (string) (int) $part_id,
                'compare' => '=',
            ],
            [
                'key'     => '_inventory_variant_condition_id',
                'value'   => (string) (int) $condition_id,
                'compare' => '=',
            ],
        ],
    ]);

    if (!empty($query->posts)) {
        return (int) $query->posts[0];
    }

    return 0;
}

/**
 * Find the Product Listing for a Part + Condition combination,
 * or create it if it does not exist.
 */
function inventory_variant_get_or_create($part_id, $condition_id)
{
    $part_id      = (int) $part_id;
    $condition_id = (int) $condition_id;

    if (!$part_id || !$condition_id) {
        return new WP_Error(
            'inventory_variant_invalid_terms',
            'A valid Part and Condition are required.',
            ['status' => 400]
        );
    }

    $title = inventory_variant_build_listing_title(
        $part_id,
        $condition_id
    );

    if (is_wp_error($title)) {
        return $title;
    }

    // Reuse the existing listing when the combination already exists.
    $existing_id = inventory_variant_find_listing(
        $part_id,
        $condition_id
    );

    if ($existing_id) {
        inventory_variant_sync_listing_title($existing_id);

        return $existing_id;
    }

    // Generate an SKU only when a new listing is required.
    $sku = inventory_variant_generate_sku();

    if (is_wp_error($sku)) {
        return $sku;
    }

    $variant_id = wp_insert_post(
        [
            'post_type'   => 'product_variant',
            'post_status' => 'publish',
            'post_title'  => $title,
        ],
        true
    );

    if (is_wp_error($variant_id)) {
        return $variant_id;
    }

    update_post_meta(
        $variant_id,
        '_inventory_variant_part_id',
        $part_id
    );

    update_post_meta(
        $variant_id,
        '_inventory_variant_condition_id',
        $condition_id
    );

    update_post_meta(
        $variant_id,
        '_inventory_variant_sku',
        $sku
    );

    return (int) $variant_id;
}

/**
 * Validate Product Listing fields before creating or updating a listing.
 *
 * Returns normalized data or a WP_Error.
 *
 * Product Listing titles are intentionally not accepted from the request.
 * They are always generated from the associated Part and Condition.
 */
function inventory_variant_validate_listing_data(
    WP_REST_Request $request,
    $part_id,
    $condition_id,
    $variant_id = 0,
    $is_new = false
) {
    $variant_id = (int) $variant_id;

    /*
     * Validate SKU.
     */
    $sku = null;

    if ($request->has_param('sku')) {
        $sku = sanitize_text_field(
            (string) $request->get_param('sku')
        );

        if (!preg_match('/^[0-9]{7}$/', $sku)) {
            return new WP_Error(
                'inventory_variant_invalid_sku',
                'SKU must contain exactly seven digits.',
                ['status' => 400]
            );
        }

        if (inventory_variant_sku_exists($sku, $variant_id)) {
            return new WP_Error(
                'inventory_variant_duplicate_sku',
                'That SKU is already assigned to another Product Listing.',
                ['status' => 409]
            );
        }
    }

    /*
     * Validate pricing mode.
     */
    if ($request->has_param('price_mode')) {
        $price_mode = sanitize_text_field(
            (string) $request->get_param('price_mode')
        );
    } else {
        $price_mode = $variant_id
            ? get_post_meta($variant_id, 'price_mode', true)
            : '';
    }

    if (!in_array($price_mode, ['automatic', 'manual'], true)) {
        return new WP_Error(
            'inventory_variant_invalid_price_mode',
            'Price mode must be automatic or manual.',
            ['status' => 400]
        );
    }

    /*
     * Validate and calculate listing price.
     */
    if ($price_mode === 'automatic') {
        $list_price = inventory_calculate_product_price(
            $part_id,
            $condition_id
        );

        if (is_wp_error($list_price)) {
            return $list_price;
        }

        if ($list_price === null || $list_price <= 0) {
            return new WP_Error(
                'inventory_variant_price_unavailable',
                'Automatic pricing is unavailable. Please enter a manual listing price.',
                ['status' => 400]
            );
        }
    } else {
        if ($request->has_param('list_price')) {
            $submitted_price = $request->get_param('list_price');

            if (
                !is_numeric($submitted_price) ||
                (float) $submitted_price <= 0
            ) {
                return new WP_Error(
                    'inventory_variant_invalid_price',
                    'Enter a valid listing price greater than zero.',
                    ['status' => 400]
                );
            }

            $list_price = round((float) $submitted_price, 2);
        } elseif ($variant_id && !$is_new) {
            $existing_price = get_post_meta(
                $variant_id,
                'list_price',
                true
            );

            if (
                !is_numeric($existing_price) ||
                (float) $existing_price <= 0
            ) {
                return new WP_Error(
                    'inventory_variant_missing_price',
                    'A listing price is required when using manual pricing.',
                    ['status' => 400]
                );
            }

            $list_price = (float) $existing_price;
        } else {
            return new WP_Error(
                'inventory_variant_missing_price',
                'A listing price is required when using manual pricing.',
                ['status' => 400]
            );
        }
    }

    /*
     * Validate optional text fields.
     */
    $text_fields = [
        'short_description',
        'long_description',
        'seo_title',
        'meta_description',
        'search_terms',
    ];

    $validated_text = [];

    foreach ($text_fields as $field) {
        if ($request->has_param($field)) {
            $validated_text[$field] = sanitize_textarea_field(
                (string) $request->get_param($field)
            );
        }
    }

    /*
     * Validate main image.
     */
    $image_id = null;

    if ($request->has_param('image_id')) {
        $image_id = absint($request->get_param('image_id'));

        if (
            $image_id &&
            get_post_type($image_id) !== 'attachment'
        ) {
            return new WP_Error(
                'inventory_variant_invalid_image',
                'The selected main image is not a valid attachment.',
                ['status' => 400]
            );
        }
    }

    /*
     * Validate additional images.
     */
    $image_ids = null;

    if ($request->has_param('additional_image_ids')) {
        $submitted_images = $request->get_param(
            'additional_image_ids'
        );

        if (!is_array($submitted_images)) {
            return new WP_Error(
                'inventory_variant_invalid_images',
                'Additional image IDs must be an array.',
                ['status' => 400]
            );
        }

        $image_ids = [];

        foreach ($submitted_images as $submitted_image_id) {
            $attachment_id = absint($submitted_image_id);

            if (
                !$attachment_id ||
                get_post_type($attachment_id) !== 'attachment'
            ) {
                return new WP_Error(
                    'inventory_variant_invalid_images',
                    'One or more additional image IDs are invalid.',
                    ['status' => 400]
                );
            }

            $image_ids[] = $attachment_id;
        }

        $image_ids = array_values(array_unique($image_ids));
    }

    /*
     * Validate listing status.
     */
    $status = null;

    if ($request->has_param('status')) {
        $status = sanitize_text_field(
            (string) $request->get_param('status')
        );

        if (!in_array($status, ['publish', 'draft'], true)) {
            return new WP_Error(
                'inventory_variant_invalid_status',
                'Status must be publish or draft.',
                ['status' => 400]
            );
        }
    }

    return [
        'sku'          => $sku,
        'price_mode'   => $price_mode,
        'list_price'   => $list_price,
        'text_fields'  => $validated_text,
        'image_id'     => $image_id,
        'image_ids'    => $image_ids,
        'status'       => $status,
    ];
}

/**
 * Associate an inventory product with its Part + Condition listing.
 *
 * If the product's Part or Condition changes, its association is
 * changed accordingly. The old listing is intentionally retained.
 */
function inventory_variant_sync_product($product_id)
{
    $product_id = (int) $product_id;

    if (get_post_type($product_id) !== 'product') {
        return false;
    }

    $part_ids = wp_get_object_terms(
        $product_id,
        'part',
        ['fields' => 'ids']
    );

    $condition_ids = wp_get_object_terms(
        $product_id,
        'condition',
        ['fields' => 'ids']
    );

    if (is_wp_error($part_ids)) {
        return $part_ids;
    }

    if (is_wp_error($condition_ids)) {
        return $condition_ids;
    }

    if (empty($part_ids) || empty($condition_ids)) {
        delete_post_meta($product_id, '_inventory_variant_id');
        return false;
    }

    // Products are expected to have one Part and one Condition.
    $part_id = (int) reset($part_ids);
    $condition_id = (int) reset($condition_ids);

    $variant_id = inventory_variant_get_or_create(
        $part_id,
        $condition_id
    );

    if (is_wp_error($variant_id)) {
        return $variant_id;
    }

    update_post_meta(
        $product_id,
        '_inventory_variant_id',
        $variant_id
    );

    return $variant_id;
}

/**
 * Run after the existing product REST save logic.
 *
 * Priority 20 allows the existing priority-10 save handler to run first.
 */
function inventory_variant_after_product_rest_save(
    $post,
    $request,
    $creating
) {
    if (!$post || is_wp_error($post)) {
        return;
    }

    inventory_variant_sync_product($post->ID);
}

add_action(
    'rest_after_insert_product',
    'inventory_variant_after_product_rest_save',
    20,
    3
);

/**
 * One-time association pass for existing inventory products.
 */
function inventory_variant_backfill_existing_products()
{
    if (get_option('inventory_variant_backfill_v1_complete')) {
        return true;
    }

    $query = new WP_Query([
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'fields'         => 'ids',
        'orderby'        => 'ID',
        'order'          => 'ASC',
        'no_found_rows'  => true,
    ]);

    $had_error = false;

    foreach ($query->posts as $product_id) {
        $result = inventory_variant_sync_product($product_id);

        if (is_wp_error($result)) {
            $had_error = true;

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(
                    'Inventory variant sync failed for product ' .
                        (int) $product_id . ': ' .
                        $result->get_error_message()
                );
            }
        }
    }

    if (!$had_error) {
        update_option(
            'inventory_variant_backfill_v1_complete',
            1,
            false
        );

        return true;
    }

    return new WP_Error(
        'inventory_variant_backfill_incomplete',
        'Some existing products could not be associated with listings. Please retry the Stock Summary request.',
        ['status' => 500]
    );
}

/**
 * Calculate active quantity from associated, published inventory products.
 *
 * Quantity is calculated dynamically rather than stored on the listing.
 */
function inventory_variant_get_available_quantity($variant_id)
{
    $query = new WP_Query([
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'no_found_rows'  => false,
        'meta_query'     => [
            'relation' => 'AND',
            [
                'key'     => '_inventory_variant_id',
                'value'   => (string) (int) $variant_id,
                'compare' => '=',
            ],
            [
                'key'     => 'inventory_status',
                'value'   => 'active',
                'compare' => '=',
            ],
        ],
    ]);

    return (int) $query->found_posts;
}

/**
 * Transform a Product Listing into the frontend API format.
 *
 * A Product Listing is an existing product_variant post.
 * Its WordPress post ID is the product_listing_id used
 * when associating serialized Products.
 */

function inventory_variant_transform_listing($variant)
{
    $variant_id = is_object($variant)
        ? (int) $variant->ID
        : (int) $variant;

    $post = get_post($variant_id);

    if (!$post || $post->post_type !== 'product_variant') {
        return null;
    }

    // Keep title synchronized with the Part and Condition.
    $title = inventory_variant_sync_listing_title($variant_id);

    if (is_wp_error($title) || $title === false) {
        $title = $post->post_title;
    }

    // Get associated Part and Condition.
    $part_id = (int) get_post_meta(
        $variant_id,
        '_inventory_variant_part_id',
        true
    );

    $condition_id = (int) get_post_meta(
        $variant_id,
        '_inventory_variant_condition_id',
        true
    );

    // Retrieve the master Part record.
    $part = get_term($part_id, 'part');

    if (!$part || is_wp_error($part)) {
        return null;
    }

    // Inherited Part information.
    $brand_id = (int) get_term_meta($part_id, 'brand_id', true);
    $category_id = (int) get_term_meta($part_id, 'category_id', true);
    $series_id = (int) get_term_meta($part_id, 'series_id', true);

    $part_number = get_term_meta($part_id, 'part_number', true);
    $gtin = get_term_meta($part_id, 'gtin', true);

    $google_product_category = get_term_meta(
        $part_id,
        'google_product_category',
        true
    );

    $short_description = get_term_meta(
        $part_id,
        'short_description',
        true
    );

    $long_description = get_term_meta(
        $part_id,
        'long_description',
        true
    );

    $seo_title = get_term_meta($part_id, 'seo_title', true);

    $meta_description = get_term_meta(
        $part_id,
        'meta_description',
        true
    );

    $search_terms = get_term_meta(
        $part_id,
        'search_terms',
        true
    );

    // Retrieve Part images.
    $image_id = absint(
        get_term_meta($part_id, 'image_id', true)
    );

    $additional_image_ids = get_term_meta(
        $part_id,
        'additional_image_ids',
        true
    );

    $additional_image_ids = is_array($additional_image_ids)
        ? array_values(
            array_filter(
                array_map('absint', $additional_image_ids)
            )
        )
        : [];

    // Generate additional image URLs.
    $additional_image_urls = [];

    foreach ($additional_image_ids as $attachment_id) {
        $url = wp_get_attachment_image_url(
            $attachment_id,
            'full'
        );

        if ($url) {
            $additional_image_urls[] = $url;
        }
    }

    return [
        // Listing identity.
        'id' => $variant_id,
        'title' => $title,
        'sku' => (string) get_post_meta(
            $variant_id,
            '_inventory_variant_sku',
            true
        ),

        // Associated Part.
        'part_id' => $part_id,
        'part_name' => html_entity_decode(
            $part->name,
            ENT_QUOTES | ENT_HTML5,
            get_bloginfo('charset') ?: 'UTF-8'
        ),
        'part_number' => $part_number ?: '',
        'brand_id' => $brand_id,
        'category_id' => $category_id,
        'series_id' => $series_id ?: null,

        // Listing condition and pricing.
        'condition_id' => $condition_id,
        'list_price' => get_post_meta(
            $variant_id,
            'list_price',
            true
        ),
        'price_mode' => get_post_meta(
            $variant_id,
            'price_mode',
            true
        ),

        // Inherited descriptions and SEO.
        'short_description' => $short_description ?: '',
        'long_description' => $long_description ?: '',
        'description' => $long_description ?: '',
        'seo_title' => $seo_title ?: '',
        'meta_description' => $meta_description ?: '',
        'search_terms' => $search_terms ?: '',

        // Google product information.
        'gtin' => $gtin ?: '',
        'google_product_category' => $google_product_category ?: '',

        // Inherited Part images.
        'image_id' => $image_id ?: null,
        'image_url' => $image_id
            ? wp_get_attachment_image_url($image_id, 'full')
            : null,
        'additional_image_ids' => $additional_image_ids,
        'additional_image_urls' => $additional_image_urls,

        // Listing availability.
        'status' => $post->post_status,
        'quantity' => inventory_variant_get_available_quantity(
            $variant_id
        ),
    ];
}


/**
 * Save editable fields for a Product Listing.
 *
 * All submitted fields are validated before any changes are made.
 * The title is always generated from the Part and Condition.
 */
function inventory_variant_save_listing_fields(
    $variant_id,
    WP_REST_Request $request,
    $is_new = false
) {
    $variant_id = (int) $variant_id;

    $variant = get_post($variant_id);

    if (!$variant || $variant->post_type !== 'product_variant') {
        return new WP_Error(
            'inventory_variant_not_found',
            'The requested Product Listing was not found.',
            ['status' => 404]
        );
    }

    $part_id = (int) get_post_meta(
        $variant_id,
        '_inventory_variant_part_id',
        true
    );

    $condition_id = (int) get_post_meta(
        $variant_id,
        '_inventory_variant_condition_id',
        true
    );

    $data = inventory_variant_validate_listing_data(
        $request,
        $part_id,
        $condition_id,
        $variant_id,
        $is_new
    );

    if (is_wp_error($data)) {
        return $data;
    }

    // Only listing status is editable on the WordPress post itself.
    if ($data['status'] !== null) {
        $updated = wp_update_post(
            [
                'ID'          => $variant_id,
                'post_status' => $data['status'],
            ],
            true
        );

        if (is_wp_error($updated)) {
            return $updated;
        }
    }

    // Save SKU when supplied.
    if ($data['sku'] !== null) {
        update_post_meta(
            $variant_id,
            '_inventory_variant_sku',
            $data['sku']
        );
    }

    // Save pricing.
    update_post_meta(
        $variant_id,
        'price_mode',
        $data['price_mode']
    );

    update_post_meta(
        $variant_id,
        'list_price',
        $data['list_price']
    );

    // Save text fields.
    foreach ($data['text_fields'] as $field => $value) {
        update_post_meta($variant_id, $field, $value);
    }

    // Save main image.
    if ($data['image_id'] !== null) {
        if ($data['image_id']) {
            update_post_meta(
                $variant_id,
                'image_id',
                $data['image_id']
            );
        } else {
            delete_post_meta($variant_id, 'image_id');
        }
    }

    // Save additional images.
    if ($data['image_ids'] !== null) {
        update_post_meta(
            $variant_id,
            'additional_image_ids',
            $data['image_ids']
        );
    }

    return inventory_variant_transform_listing($variant_id);
}

/**
 * Retrieve all published and draft Product Listings.
 */
function inventory_variant_get_listings(WP_REST_Request $request)
{
    $query = new WP_Query([
        'post_type'      => 'product_variant',
        'post_status'    => ['publish', 'draft'],
        'posts_per_page' => -1,
        'orderby'        => 'ID',
        'order'          => 'ASC',
        'no_found_rows'  => true,
    ]);

    $listings = [];

    foreach ($query->posts as $post) {
        $listing = inventory_variant_transform_listing($post);

        if ($listing) {
            $listings[] = $listing;
        }
    }

    return rest_ensure_response($listings);
}

/**
 * Create or retrieve a Product Listing for a Part + Condition.
 *
 * Validate the request before creating a new WordPress post.
 */
function inventory_variant_create_listing(WP_REST_Request $request)
{
    $part_id = absint($request->get_param('part_id'));
    $condition_id = absint($request->get_param('condition_id'));

    if (!$part_id || !$condition_id) {
        return new WP_Error(
            'inventory_variant_missing_terms',
            'A Part and Condition are required.',
            ['status' => 400]
        );
    }

    // Confirm that both selected taxonomy terms exist.
    $part = get_term($part_id, 'part');
    $condition = get_term($condition_id, 'condition');

    if (
        !$part ||
        is_wp_error($part) ||
        !$condition ||
        is_wp_error($condition)
    ) {
        return new WP_Error(
            'inventory_variant_terms_not_found',
            'The selected Part or Condition could not be found.',
            ['status' => 400]
        );
    }

    // Find an existing listing without creating anything.
    $existing_id = inventory_variant_find_listing(
        $part_id,
        $condition_id
    );

    // Only treat this as a new listing if no matching listing exists.
    $is_new = !$existing_id;

    // Validate the complete request before creating a new listing.
    $data = inventory_variant_validate_listing_data(
        $request,
        $part_id,
        $condition_id,
        $existing_id,
        $is_new
    );

    if (is_wp_error($data)) {
        return $data;
    }

    // Only create the listing after validation succeeds.
    $variant_id = inventory_variant_get_or_create(
        $part_id,
        $condition_id
    );

    if (is_wp_error($variant_id)) {
        return $variant_id;
    }

    return inventory_variant_save_listing_fields(
        $variant_id,
        $request,
        $is_new
    );
}

/**
 * Update an existing Product Listing.
 */
function inventory_variant_update_listing(WP_REST_Request $request)
{
    $variant_id = absint($request['variant_id']);
    $variant = get_post($variant_id);

    if (!$variant || $variant->post_type !== 'product_variant') {
        return new WP_Error(
            'inventory_variant_not_found',
            'The requested Product Listing was not found.',
            ['status' => 404]
        );
    }

    return inventory_variant_save_listing_fields(
        $variant_id,
        $request
    );
}

function inventory_variant_delete_listing(WP_REST_Request $request)
{

    $variant_id = absint($request['variant_id']);

    // Confirm the Product Listing exists.
    $variant = get_post($variant_id);

    if (! $variant || 'product_variant' !== $variant->post_type) {
        return new WP_Error(
            'inventory_variant_not_found',
            'Product Listing not found.',
            ['status' => 404]
        );
    }

    // Check whether serialized Products are still attached.
    $associated_products = new WP_Query([
        'post_type'      => 'product',
        'post_status'    => 'any',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'meta_query'     => [
            [
                'key'     => '_inventory_variant_id',
                'value'   => $variant_id,
                'compare' => '=',
            ],
        ],
    ]);

    if ($associated_products->have_posts()) {
        return new WP_Error(
            'inventory_variant_has_products',
            'This Product Listing cannot be deleted while serialized products are still associated with it. Remove or reassign those products first.',
            ['status' => 409]
        );
    }

    // Permanently delete the Product Listing.
    $deleted = wp_delete_post($variant_id, true);

    if (! $deleted) {
        return new WP_Error(
            'inventory_variant_delete_failed',
            'Unable to delete the Product Listing.',
            ['status' => 500]
        );
    }

    return rest_ensure_response([
        'deleted' => true,
        'id'      => $variant_id,
    ]);
}

/**
 * Return Stock Summary rows.
 */
function inventory_variant_get_stock_summary(WP_REST_Request $request)
{
    $backfill = inventory_variant_backfill_existing_products();

    if (is_wp_error($backfill)) {
        return $backfill;
    }

    $variants = new WP_Query([
        'post_type'      => 'product_variant',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'orderby'        => 'ID',
        'order'          => 'ASC',
        'no_found_rows'  => true,
    ]);

    $rows = [];

    foreach ($variants->posts as $variant) {
        $variant_id = (int) $variant->ID;

        $part_id = (int) get_post_meta(
            $variant_id,
            '_inventory_variant_part_id',
            true
        );

        $condition_id = (int) get_post_meta(
            $variant_id,
            '_inventory_variant_condition_id',
            true
        );

        $part = get_term($part_id, 'part');
        $condition = get_term($condition_id, 'condition');

        // Ignore listings whose related taxonomy terms no longer exist.
        if (
            !$part ||
            is_wp_error($part) ||
            !$condition ||
            is_wp_error($condition)
        ) {
            continue;
        }

        $rows[] = [
            'id'             => $variant_id,
            'part_id'        => $part_id,
            'part_name'      => $part->name,
            'condition_id'   => $condition_id,
            'condition_name' => $condition->name,
            'available_qty'  => inventory_variant_get_available_quantity(
                $variant_id
            ),
            'sku'            => (string) get_post_meta(
                $variant_id,
                '_inventory_variant_sku',
                true
            ),
        ];
    }

    // Sort by Part name, then Condition name.
    usort($rows, function ($a, $b) {
        $part_comparison = strcasecmp(
            $a['part_name'],
            $b['part_name']
        );

        if ($part_comparison !== 0) {
            return $part_comparison;
        }

        return strcasecmp(
            $a['condition_name'],
            $b['condition_name']
        );
    });

    return rest_ensure_response($rows);
}


/**
 * Register Stock Summary and Product Listing API routes.
 */
function inventory_register_variant_api_routes()
{
    // Stock Summary: retrieve rows.
    register_rest_route('inventory/v1', '/stock-summary', [
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'inventory_variant_get_stock_summary',
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            },
        ],
    ]);

    // Stock Summary: update SKU.
    register_rest_route(
        'inventory/v1',
        '/stock-summary/(?P<variant_id>\d+)/sku',
        [
            [
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => 'inventory_variant_update_sku',
                'permission_callback' => function () {
                    return current_user_can('edit_posts');
                },
                'args' => [
                    'sku' => [
                        'required' => true,
                        'type'     => 'string',
                    ],
                ],
            ],
        ]
    );

    // Product Listing: retrieve and create.
    register_rest_route('inventory/v1', '/product-listings', [
        [
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => 'inventory_variant_get_listings',
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            },
        ],
        [
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => 'inventory_variant_create_listing',
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            },
            'args' => [
                'part_id' => [
                    'required' => true,
                    'type'     => 'integer',
                ],
                'condition_id' => [
                    'required' => true,
                    'type'     => 'integer',
                ],
                'price_mode' => [
                    'required' => true,
                    'type'     => 'string',
                    'enum'     => ['automatic', 'manual'],
                ],
            ],
        ],
    ]);

    // Product Listing: update and delete.
    register_rest_route(
        'inventory/v1',
        '/product-listings/(?P<variant_id>\d+)',
        [
            [
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => 'inventory_variant_update_listing',
                'permission_callback' => function () {
                    return current_user_can('edit_posts');
                },
            ],
            [
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => 'inventory_variant_delete_listing',
                'permission_callback' => function () {
                    return current_user_can('edit_posts');
                },
            ],
        ]
    );
}

add_action(
    'rest_api_init',
    'inventory_register_variant_api_routes'
);