<?php
/*
Plugin Name: Inventory Products
Description: Headless inventory system (WordPress = API only, React = UI).
Version: 3.9.2
Author: Tatyana
*/

if (!defined('ABSPATH')) exit;

add_filter('wp_insert_post_data', function ($data, $postarr) {

    if ($data['post_type'] !== 'product') {
        return $data;
    }

    // Try to get serial number from REST payload
    $serial = '';

    if (!empty($_REQUEST['serial_number'])) {
        $serial = sanitize_text_field($_REQUEST['serial_number']);
    } elseif (!empty($postarr['meta_input']['serial_number'])) {
        $serial = sanitize_text_field($postarr['meta_input']['serial_number']);
    }

    // Get part name (REST-safe)
$part_title = '';

$part_ids = $_REQUEST['part']
    ?? $postarr['tax_input']['part']
    ?? [];

if (!empty($part_ids[0])) {

    $part_id = (int) $part_ids[0];

    $term = get_term($part_id, 'part');

    if ($term && !is_wp_error($term)) {
        $part_title = $term->name;
    }
}

    // Build title safely
    if (empty($data['post_title'])) {

        if ($part_title && $serial) {
            $data['post_title'] = $part_title . ' | ' . $serial;
        } elseif ($serial) {
            $data['post_title'] = 'Product | ' . $serial;
        } else {
            $data['post_title'] = 'Product #' . time();
        }
    }

    return $data;

}, 10, 2);

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
        'capability_type' => 'post',
        'map_meta_cap' => true,
    ]);

}, 0);



//////////////////////////////////////////////////////////
// TAXONOMIES (FIXED)
//////////////////////////////////////////////////////////

add_action('init', function () {

    $taxonomies = [
        'inventory_category',
        'brand',
        'part',
        'shelf',
        'series', 
        'condition'
    ];

    foreach ($taxonomies as $tax) {

        register_taxonomy($tax, ['product'], [
            'label' => ucfirst(str_replace('_', ' ', $tax)),
            'public' => true,
            'show_in_rest' => true,
            'hierarchical' => true,
            'publicly_queryable' => true,
        ]);
    }

}, 0);

//////////////////////////////////////////////////////////
// PART META (brand + category relation)
//////////////////////////////////////////////////////////

add_action('part_add_form_fields', function () {

    $brands = get_terms(['taxonomy' => 'brand', 'hide_empty' => false]);
    $categories = get_terms(['taxonomy' => 'inventory_category', 'hide_empty' => false]);
?>

<div class="form-field">
    <label>Brand</label>
    <select name="brand_id">
        <option value="">Select Brand</option>
        <?php foreach ($brands as $brand): ?>
            <option value="<?php echo esc_attr($brand->term_id); ?>">
                <?php echo esc_html($brand->name); ?>
            </option>
        <?php endforeach; ?>
    </select>
</div>

<div class="form-field">
    <label>Category</label>
    <select name="category_id">
        <option value="">Select Category</option>
        <?php foreach ($categories as $category): ?>
            <option value="<?php echo esc_attr($category->term_id); ?>">
                <?php echo esc_html($category->name); ?>
            </option>
        <?php endforeach; ?>
    </select>
</div>

<?php
});

add_action('part_edit_form_fields', function ($term) {

    $brands = get_terms(['taxonomy' => 'brand', 'hide_empty' => false]);
    $categories = get_terms(['taxonomy' => 'inventory_category', 'hide_empty' => false]);

    $selected_brand = get_term_meta($term->term_id, 'brand_id', true);
    $selected_category = get_term_meta($term->term_id, 'category_id', true);
?>

<tr class="form-field">
    <th>Brand</th>
    <td>
        <select name="brand_id">
            <?php foreach ($brands as $brand): ?>
                <option value="<?php echo esc_attr($brand->term_id); ?>"
                    <?php selected($selected_brand, $brand->term_id); ?>>
                    <?php echo esc_html($brand->name); ?>
                </option>
            <?php endforeach; ?>
        </select>
    </td>
</tr>

<tr class="form-field">
    <th>Category</th>
    <td>
        <select name="category_id">
            <?php foreach ($categories as $category): ?>
                <option value="<?php echo esc_attr($category->term_id); ?>"
                    <?php selected($selected_category, $category->term_id); ?>>
                    <?php echo esc_html($category->name); ?>
                </option>
            <?php endforeach; ?>
        </select>
    </td>
</tr>

<?php
});

add_action('created_part', 'inventory_save_part_meta');
add_action('edited_part', 'inventory_save_part_meta');

function inventory_save_part_meta($term_id) {

    if (isset($_POST['brand_id'])) {
        update_term_meta($term_id, 'brand_id', (int) $_POST['brand_id']);
    }

    if (isset($_POST['category_id'])) {
        update_term_meta($term_id, 'category_id', (int) $_POST['category_id']);
    }
}

//////////////////////////////////////////////////////////
// PRODUCT META
//////////////////////////////////////////////////////////

add_action('init', function () {

    $fields = [
        'serial_number',
        'work_order',
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

}, 0);

//////////////////////////////////////////////////////////
// TRANSFORMER (FIXED + SAFE)
//////////////////////////////////////////////////////////

function inventory_transform_product($post) {

    $data = [
        'id' => $post->ID,
        'title' => get_the_title($post->ID) ?: "",
    ];

    $fields = [
        'serial_number',
        'work_order',
        'list_price',
        'notes',
        'test_status',
        'test_date'
    ];

    foreach ($fields as $field) {
        $value = get_post_meta($post->ID, $field, true);

        $data[$field] = ($field === 'test_status')
            ? (bool) $value
            : ($value ?: "");
    }

    $taxonomies = [
        'inventory_category',
        'brand',
        'part',
        'shelf',
        'series', 
        'condition'
    ];

    foreach ($taxonomies as $tax) {

        if (!taxonomy_exists($tax)) {
            $data[$tax] = [];
            continue;
        }

        $terms = wp_get_post_terms($post->ID, $tax);

        if (is_wp_error($terms)) {
            $data[$tax] = [];
            continue;
        }

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

add_filter('rest_prepare_product', function ($response, $post) {

    $response->data = array_merge(
        $response->data,
        inventory_transform_product($post)
    );

    return $response;

}, 10, 3);

//////////////////////////////////////////////////////////
// CREATE / UPDATE (HARDENED)
//////////////////////////////////////////////////////////

add_action('rest_after_insert_product', function ($post, $request) {

    /*
    --------------------------------------------------
    1. META FIELDS
    --------------------------------------------------
    */
    $meta_fields = [
        'serial_number',
        'work_order',
        'list_price',
        'notes',
        'test_status',
        'test_date'
    ];

    foreach ($meta_fields as $field) {

        $value = $request->get_param($field);

        // allow false / 0 / empty string
        if ($value !== null) {
            update_post_meta($post->ID, $field, $value);
        }
    }

    /*
--------------------------------------------------
5. CONDITION RELATION
--------------------------------------------------
*/
$condition_ids = $request->get_param('condition');

if (is_array($condition_ids)) {

    $condition_ids = array_values(
        array_filter(
            array_map('intval', $condition_ids)
        )
    );

    wp_set_post_terms($post->ID, $condition_ids, 'condition');
}

    /*
    --------------------------------------------------
    2. PART RELATION
    --------------------------------------------------
    */
    $part_ids = $request->get_param('part');

    if (is_array($part_ids)) {

        $part_ids = array_values(
            array_filter(
                array_map('intval', $part_ids)
            )
        );

        // save part relationship
        wp_set_post_terms($post->ID, $part_ids, 'part');

        /*
        --------------------------------------------------
        3. AUTO DERIVE BRAND + CATEGORY
        --------------------------------------------------
        */
        if (!empty($part_ids[0])) {

            $part_id = $part_ids[0];

            $brand_id = (int) get_term_meta($part_id, 'brand_id', true);

            $category_id = (int) get_term_meta($part_id, 'category_id', true);

            // auto attach brand
            if ($brand_id) {
                wp_set_post_terms($post->ID, [$brand_id], 'brand');
            }

            // auto attach category
            if ($category_id) {
                wp_set_post_terms($post->ID, [$category_id], 'inventory_category');
            }
        }
    }

    /*
    --------------------------------------------------
    4. SHELF RELATION
    --------------------------------------------------
    */
    $shelf_ids = $request->get_param('shelf');

    if (is_array($shelf_ids)) {

        $shelf_ids = array_values(
            array_filter(
                array_map('intval', $shelf_ids)
            )
        );

        wp_set_post_terms($post->ID, $shelf_ids, 'shelf');
    }

}, 10, 2);
//////////////////////////////////////////////////////////
// CUSTOM PARTS ENDPOINT (FIXED + HYDRATED)
//////////////////////////////////////////////////////////

add_action('rest_api_init', function () {

    register_rest_route('inventory/v1', '/parts', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function ($request) {

            $brand_id = (int) $request->get_param('brand_id');

            if (!$brand_id) return [];

            $parts = get_terms([
                'taxonomy' => 'part',
                'hide_empty' => false,
            ]);

            if (is_wp_error($parts)) return [];

            $result = [];

            foreach ($parts as $part) {

                $part_brand_id = (int) get_term_meta($part->term_id, 'brand_id', true);
                $part_category_id = (int) get_term_meta($part->term_id, 'category_id', true);

                if ($part_brand_id !== $brand_id) continue;

                $brand = $part_brand_id ? get_term($part_brand_id, 'brand') : null;
                $category = $part_category_id ? get_term($part_category_id, 'inventory_category') : null;

                $result[] = [
                    'id' => $part->term_id,
                    'name' => $part->name,
                    'slug' => $part->slug,

                    'brand_id' => $part_brand_id,
                    'category_id' => $part_category_id,

                    'brand' => $brand ? [
                        'id' => $brand->term_id,
                        'name' => $brand->name,
                        'slug' => $brand->slug,
                    ] : null,

                    'category' => $category ? [
                        'id' => $category->term_id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                    ] : null,

                    'image_id' => null,
                ];
            }

            return $result;
        }
    ]);
});