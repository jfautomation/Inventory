<?php

if (!defined('ABSPATH')) exit;

/**
 * =========================
 * PART TAXONOMY UI
 * =========================
 */

add_action('part_add_form_fields', 'inventory_part_add_fields');
add_action('part_edit_form_fields', 'inventory_part_edit_fields');

function inventory_part_add_fields()
{
    $brands = get_terms([
        'taxonomy'   => 'brand',
        'hide_empty' => false
    ]);

    $categories = get_terms([
        'taxonomy'   => 'inventory_category',
        'hide_empty' => false
    ]);
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
}

function inventory_part_edit_fields($term)
{
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
}

/**
 * =========================
 * SAVE TERM META
 * =========================
 */

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