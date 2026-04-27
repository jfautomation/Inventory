<?php
/*
Plugin Name: Inventory Products
Description: Custom plugin for managing internal inventory products with REST API.
Version: 1.2
Author: Tatyana
*/

if (!defined('ABSPATH')) exit;

//////////////////////////////////////////////////////////
// Register Product Custom Post Type
//////////////////////////////////////////////////////////

add_action('init', function() {

    $labels = [
        'name' => 'Products',
        'singular_name' => 'Product',
        'menu_name' => 'Products',
        'add_new' => 'Add New Product',
        'add_new_item' => 'Add New Product',
        'edit_item' => 'Edit Product',
        'new_item' => 'New Product',
        'view_item' => 'View Product',
        'all_items' => 'All Products',
        'search_items' => 'Search Products',
        'not_found' => 'No Products found',
        'not_found_in_trash' => 'No Products found in Trash'
    ];

    $args = [
        'labels' => $labels,
        'public' => true,
        'has_archive' => true,
        'show_in_rest' => true,
        'supports' => ['title'],
        'menu_icon' => 'dashicons-products'
    ];

    register_post_type('product', $args);

});

//////////////////////////////////////////////////////////
// Register Taxonomies
//////////////////////////////////////////////////////////

add_action('init', function() {

    register_taxonomy('brand', 'product', [
        'label' => 'Brands',
        'public' => true,
        'show_in_rest' => true,
        'hierarchical' => false,
        'show_ui' => true,
        'show_admin_column' => true,
    ]);

    register_taxonomy('part', 'product', [
        'label' => 'Parts',
        'public' => true,
        'show_in_rest' => true,
        'hierarchical' => false,
        'show_ui' => true,
        'show_admin_column' => true,
    ]);

    register_taxonomy('shelf', 'product', [
        'label' => 'Shelves',
        'public' => true,
        'show_in_rest' => true,
        'hierarchical' => false,
        'show_ui' => true,
        'show_admin_column' => true,
    ]);
    register_taxonomy('series', 'product', [
    'label' => 'Series',
    'public' => true,
    'show_in_rest' => true,
    'hierarchical' => false,
    'show_ui' => true,
    'show_admin_column' => true,
]);

});

add_action('init', function() {
    register_term_meta('series', 'part_id', [
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
    ]);
});

//////////////////////////////////////////////////////////
// Register Product Meta Fields
//////////////////////////////////////////////////////////

add_action('init', function() {

    $fields = [
        'serial_number',
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

            // 🔥 THIS is the important fix
           'show_in_rest' => true,

            'auth_callback' => function() {
                return current_user_can('edit_posts');
            },
        ]);
    }

});

//////////////////////////////////////////////////////////
// Meta Box UI
//////////////////////////////////////////////////////////

add_action('add_meta_boxes', function() {
    add_meta_box(
        'product_details',
        'Product Details',
        'render_product_meta_box',
        'product'
    );
});

function render_product_meta_box($post) {

    wp_nonce_field('save_product_meta', 'product_meta_nonce');

    $fields = [
        'serial_number' => 'Serial Number',
        'condition' => 'Condition',
        'list_price' => 'List Price',
        'notes' => 'Notes',
        'test_status' => 'Test Status',
        'test_date' => 'Test Date'
    ];

    foreach ($fields as $key => $label) {
        $value = get_post_meta($post->ID, $key, true);

        echo '<p>';
        echo '<label>' . $label . '</label><br>';

        if ($key === 'condition') {
            $options = [
                'brand_new' => 'Brand New',
                'like_new' => 'Like New',
                'refurbished' => 'Refurbished',
            ];
            echo '<select name="'.$key.'">';
            echo '<option value="">Select Condition</option>';
            foreach ($options as $opt_value => $opt_label) {
                $selected = ($value === $opt_value) ? 'selected' : '';
                echo '<option value="'.$opt_value.'" '.$selected.'>'.$opt_label.'</option>';
            }
            echo '</select>';
        } elseif ($key === 'test_status') {
            echo '<input type="checkbox" name="'.$key.'" '.checked($value, true, false).' />';
        } elseif ($key === 'test_date') {
            echo '<input type="date" name="'.$key.'" value="'.esc_attr($value).'" />';
        } else {
            echo '<input type="text" name="'.$key.'" value="'.esc_attr($value).'" style="width:100%" />';
        }

        echo '</p>';
    }
}

//////////////////////////////////////////////////////////
// Save Product Meta
//////////////////////////////////////////////////////////

add_action('save_post', function($post_id) {

    if (!isset($_POST['product_meta_nonce']) || 
        !wp_verify_nonce($_POST['product_meta_nonce'], 'save_product_meta')) return;

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    $fields = ['serial_number','condition','list_price','notes','test_status','test_date'];

    foreach ($fields as $field) {

        if ($field === 'test_status') {
            update_post_meta($post_id, $field, isset($_POST[$field]));
        } else if (isset($_POST[$field])) {
            update_post_meta($post_id, $field, sanitize_text_field($_POST[$field]));
        }

    }

});

//////////////////////////////////////////////////////////
// Part → Brand Relationship (Term Meta)
//////////////////////////////////////////////////////////

add_action('init', function() {
    register_term_meta('part', 'brand_id', [
        'type' => 'integer',
        'single' => true,
        'show_in_rest' => true,
    ]);
});

//////////////////////////////////////////////////////////
// Add Brand Dropdown to Part (Create)
//////////////////////////////////////////////////////////

add_action('part_add_form_fields', function() {

    $brands = get_terms([
        'taxonomy' => 'brand',
        'hide_empty' => false,
    ]);

    if (is_wp_error($brands)) return;
    ?>

    <div class="form-field">
        <label>Brand</label>
        <select name="brand_id">
            <option value="">Select Brand</option>
            <?php foreach ($brands as $brand): ?>
                <option value="<?php echo $brand->term_id; ?>">
                    <?php echo $brand->name; ?>
                </option>
            <?php endforeach; ?>
        </select>
    </div>

    <?php
});

//////////////////////////////////////////////////////////
// Edit Part Screen
//////////////////////////////////////////////////////////

add_action('part_edit_form_fields', function($term) {

    $brand_id = get_term_meta($term->term_id, 'brand_id', true);

    $brands = get_terms([
        'taxonomy' => 'brand',
        'hide_empty' => false,
    ]);

    if (is_wp_error($brands)) return;
    ?>

    <tr class="form-field">
        <th><label>Brand</label></th>
        <td>
            <select name="brand_id">
                <option value="">Select Brand</option>
                <?php foreach ($brands as $brand): ?>
                    <option value="<?php echo $brand->term_id; ?>" 
                        <?php selected($brand_id, $brand->term_id); ?>>
                        <?php echo $brand->name; ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </td>
    </tr>

    <?php
});

//////////////////////////////////////////////////////////
// Save Part → Brand Relationship
//////////////////////////////////////////////////////////

add_action('created_part', function($term_id) {
    if (isset($_POST['brand_id'])) {
        update_term_meta($term_id, 'brand_id', intval($_POST['brand_id']));
    }
});

add_action('edited_part', function($term_id) {
    if (isset($_POST['brand_id'])) {
        update_term_meta($term_id, 'brand_id', intval($_POST['brand_id']));
    }
});

//////////////////////////////////////////////////////////
// Handle Taxonomies from REST API (React POST)
//////////////////////////////////////////////////////////

add_action('rest_insert_product', function($post, $request, $creating) {

    if (!$creating) return; // only on create

    $taxonomies = ['brand', 'part', 'shelf', 'series'];

    foreach ($taxonomies as $taxonomy) {
        $terms = $request->get_param($taxonomy);

        if (!empty($terms) && is_array($terms)) {
            wp_set_object_terms($post->ID, $terms, $taxonomy);
        }
    }

}, 10, 3);

//////////////////////////////////////////////////////////
// Handle Taxonomies on UPDATE (React PUT/POST edit)
//////////////////////////////////////////////////////////

add_action('rest_after_insert_product', function($post, $request, $creating) {

    if ($creating) return; // only run on update

    $taxonomies = ['brand', 'part', 'shelf', 'series'];

    foreach ($taxonomies as $taxonomy) {

        $terms = $request->get_param($taxonomy);

        if (!empty($terms) && is_array($terms)) {
            wp_set_object_terms($post->ID, $terms, $taxonomy);
        }
    }

}, 10, 3);

add_filter('rest_prepare_product', function($response, $post, $request) {

    $data = $response->data;

    $fields = [
        'serial_number',
        'condition',
        'list_price',
        'notes',
        'test_status',
        'test_date'
    ];

    foreach ($fields as $field) {

    $value = get_post_meta($post->ID, $field, true);

    if ($field === 'test_status') {
        $data[$field] = $value === '1' || $value === 1 || $value === true;
    } else {
        $data[$field] = $value;
    }
}

    $response->data = $data;

    return $response;

}, 10, 3);