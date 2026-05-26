<?php
/*
PluginName: Inventory Products
Description: Headless inventory system (WordPress = API only, React = UI).
Version: 3.9.3
Author: Tatyana
*/

if (!defined('ABSPATH')) exit;

//////////////////////////////////////////////////////////
// AUTO TITLE GENERATION
//////////////////////////////////////////////////////////

add_filter('wp_insert_post_data', function ($data, $postarr) {

    if ($data['post_type'] !== 'product') {
        return $data;
    }

    $serial = '';

    if (!empty($_REQUEST['serial_number'])) {
        $serial = sanitize_text_field($_REQUEST['serial_number']);
    } elseif (!empty($postarr['meta_input']['serial_number'])) {
        $serial = sanitize_text_field($postarr['meta_input']['serial_number']);
    }

    $part_title = '';
    $part_ids = $_REQUEST['part'] ?? ($postarr['tax_input']['part'] ?? []);

    if (!empty($part_ids[0])) {
        $term = get_term((int)$part_ids[0], 'part');

        if ($term && !is_wp_error($term)) {
            $part_title = $term->name;
        }
    }

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
// TAXONOMIES
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
// PART META
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

function inventory_save_part_meta($term_id)
{

    if (isset($_POST['brand_id'])) {
        update_term_meta($term_id, 'brand_id', (int) $_POST['brand_id']);
    }

    if (isset($_POST['category_id'])) {
        update_term_meta($term_id, 'category_id', (int) $_POST['category_id']);
    }
}

//////////////////////////////////////////////////////////
// SERIES META (CLEAN + SINGLE SOURCE OF TRUTH)
//////////////////////////////////////////////////////////

add_action('series_add_form_fields', function () {

    $brands = get_terms(['taxonomy' => 'brand', 'hide_empty' => false]);
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
<?php
});

add_action('series_edit_form_fields', function ($term) {

    $brands = get_terms(['taxonomy' => 'brand', 'hide_empty' => false]);
    $selected_brand = get_term_meta($term->term_id, 'brand_id', true);
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
<?php
});

add_action('created_series', 'inventory_save_series_meta');
add_action('edited_series', 'inventory_save_series_meta');

function inventory_save_series_meta($term_id)
{
    if (isset($_POST['brand_id'])) {
        update_term_meta($term_id, 'brand_id', (int) $_POST['brand_id']);
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
        'test_date',
        'inventory_status',
        'quantity'
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
// REST TRANSFORMER
//////////////////////////////////////////////////////////

function inventory_transform_product($post)
{

    $data = [
        'id' => $post->ID,
        'title' => get_the_title($post->ID) ?: "",
    ];

    // =========================
    // META FIELDS
    // =========================
    $fields = [
        'serial_number',
        'work_order',
        'list_price',
        'notes',
        'test_date',
        'inventory_status'
    ];

    foreach ($fields as $field) {
        $value = get_post_meta($post->ID, $field, true);

        if ($field === 'inventory_status') {
            $data[$field] = ($value !== null && $value !== '')
                ? $value
                : 'active';
            continue;
        }

        $data[$field] = ($value !== null && $value !== '')
            ? $value
            : "";
    }

    // =========================
    // QUANTITY (DERIVED)
    // =========================
    $inventory_status = get_post_meta($post->ID, 'inventory_status', true) ?: 'active';
    $data['quantity'] = ($inventory_status === 'active') ? 1 : 0;

    // =========================
    // TEST STATUS
    // =========================
    $test_status = get_post_meta($post->ID, 'test_status', true);
    $data['test_status'] = (bool) $test_status;

    // =========================
    // TAXONOMIES
    // =========================
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

//////////////////////////////////////////////////////////
// REST OUTPUT FILTER
//////////////////////////////////////////////////////////

add_filter('rest_prepare_product', function ($response, $post) {

    $response->data = array_merge(
        $response->data,
        inventory_transform_product($post)
    );

    return $response;
}, 10, 3);

//////////////////////////////////////////////////////////
// CREATE / UPDATE
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// UNIQUE META VALIDATION
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// UNIQUE META VALIDATION (HELPER)
//////////////////////////////////////////////////////////

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

        'post__not_in' => $exclude_post_id
            ? [$exclude_post_id]
            : [],

        'meta_query' => [
            [
                'key'     => $meta_key,
                'value'   => $meta_value,
                'compare' => '='
            ]
        ]
    ];

    $query = new WP_Query($args);

    return $query->have_posts();
}

add_filter('rest_pre_insert_product', function ($prepared_post, $request) {

    $serial_number = trim((string) $request->get_param('serial_number'));
    $work_order    = trim((string) $request->get_param('work_order'));

    // =========================
    // SERIAL NUMBER CHECK
    // =========================
    if (
        $serial_number &&
        inventory_meta_exists('serial_number', $serial_number)
    ) {
        return new WP_Error(
            'duplicate_serial_number',
            'Serial number already exists.',
            ['status' => 400]
        );
    }

    // =========================
    // WORK ORDER CHECK
    // =========================
    if (
        $work_order &&
        inventory_meta_exists('work_order', $work_order)
    ) {
        return new WP_Error(
            'duplicate_work_order',
            'Work order already exists.',
            ['status' => 400]
        );
    }

    return $prepared_post;
}, 10, 2);

add_action('rest_after_insert_product', function ($post, $request) {

    // =========================
    // META FIELDS
    // =========================
    $meta_fields = [
        'serial_number',
        'work_order',
        'list_price',
        'notes',
        'test_status',
        'test_date',
        'inventory_status'
    ];

    foreach ($meta_fields as $field) {

        $value = $request->get_param($field);

        if ($value !== null) {
            update_post_meta($post->ID, $field, $value);
        }
    }

    // =========================
    // INVENTORY RULES
    // =========================
    $inventory_status = get_post_meta($post->ID, 'inventory_status', true);

    if (!in_array($inventory_status, ['active', 'sold', 'archived'], true)) {
        $inventory_status = 'active';

        update_post_meta($post->ID, 'inventory_status', 'active');
    }

    update_post_meta(
        $post->ID,
        'quantity',
        ($inventory_status === 'active') ? 1 : 0
    );

    // =========================
    // PART → BRAND + CATEGORY
    // =========================
    $part_ids = $request->get_param('part');

    $brand_id = 0;
    $category_id = 0;

    if (is_array($part_ids) && !empty($part_ids[0])) {

        $part_id = (int) $part_ids[0];

        $brand_id = (int) get_term_meta($part_id, 'brand_id', true);
        $category_id = (int) get_term_meta($part_id, 'category_id', true);

        if ($brand_id > 0) {
            wp_set_post_terms($post->ID, [$brand_id], 'brand', false);
        }

        if ($category_id > 0) {
            wp_set_post_terms($post->ID, [$category_id], 'inventory_category', false);
        }
    }

    // =========================
    // SERIES VALIDATION
    // =========================
    $series_ids = $request->get_param('series');

    if (is_array($series_ids)) {

        $series_ids = array_values(
            array_filter(array_map('intval', $series_ids))
        );

        $valid_series = [];

        foreach ($series_ids as $series_id) {

            $series_brand_id = (int) get_term_meta($series_id, 'brand_id', true);

            if ($brand_id === 0 || $series_brand_id === $brand_id) {
                $valid_series[] = $series_id;
            }
        }

        wp_set_post_terms(
            $post->ID,
            $valid_series,
            'series',
            false
        );
    }
}, 10, 2);
//////////////////////////////////////////////////////////
// PARTS ENDPOINT
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// PARTS ENDPOINT (GET + CREATE)
//////////////////////////////////////////////////////////

add_action('rest_api_init', function () {

    /**
     * =========================
     * GET PARTS (BY BRAND)
     * =========================
     */
    register_rest_route('inventory/v1', '/parts', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function ($request) {

            $brand_id = (int) $request->get_param('brand_id');

            if (!$brand_id) {
                return [];
            }

            $parts = get_terms([
                'taxonomy'   => 'part',
                'hide_empty' => false,
            ]);

            if (is_wp_error($parts)) {
                return [];
            }

            $result = [];

            foreach ($parts as $part) {

                $part_brand_id = (int) get_term_meta($part->term_id, 'brand_id', true);

                if ($part_brand_id !== $brand_id) {
                    continue;
                }

                $result[] = [
                    'id' => $part->term_id,
                    'name' => $part->name,
                    'slug' => $part->slug,
                    'brand_id' => $part_brand_id, // 👈 add this
                ];
            }

            return $result;
        }
    ]);


    /**
     * =========================
     * CREATE PART
     * =========================
     */
    register_rest_route('inventory/v1', '/parts', [
        'methods'  => 'POST',
        'permission_callback' => '__return_true',
        'callback' => function ($request) {

            $name        = sanitize_text_field($request->get_param('name'));
            $brand_id    = (int) $request->get_param('brand_id');
            $category_id = (int) $request->get_param('category_id');

            if (!$name) {
                return new WP_Error(
                    'missing_name',
                    'Part name is required.',
                    ['status' => 400]
                );
            }

            // CREATE TERM
            $term = wp_insert_term($name, 'part');

            if (is_wp_error($term)) {
                return new WP_Error(
                    $term->get_error_code(),
                    $term->get_error_message(),
                    ['status' => 400]
                );
            }

            $term_id = $term['term_id'];

            // SAVE META
            if ($brand_id) {
                update_term_meta($term_id, 'brand_id', $brand_id);
            }

            if ($category_id) {
                update_term_meta($term_id, 'category_id', $category_id);
            }

            return [
                'id'   => $term_id,
                'name' => $name,
                'slug' => get_term($term_id)->slug,
            ];
        }
    ]);
});

//////////////////////////////////////////////////////////
// SERIES ENDPOINT
//////////////////////////////////////////////////////////

add_action('rest_api_init', function () {

    register_rest_route('inventory/v1', '/series', [
        'methods'  => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function ($request) {

            $brand_id = (int) $request->get_param('brand_id');

            if (!$brand_id) {
                return [];
            }

            $series_terms = get_terms([
                'taxonomy' => 'series',
                'hide_empty' => false,
            ]);

            if (is_wp_error($series_terms)) {
                return [];
            }

            $result = [];

            foreach ($series_terms as $series) {

                $series_brand_id = (int) get_term_meta(
                    $series->term_id,
                    'brand_id',
                    true
                );

                if ($series_brand_id !== $brand_id) {
                    continue;
                }

                $result[] = [
                    'id' => $series->term_id,
                    'name' => $series->name,
                    'slug' => $series->slug,
                ];
            }

            return $result;
        }
    ]);
});