<?php

if (!defined('ABSPATH')) {
    exit;
}

//////////////////////////////////////////////////////////
// SERIES META UI
//////////////////////////////////////////////////////////

add_action('series_add_form_fields', 'inventory_series_add_fields');
add_action('series_edit_form_fields', 'inventory_series_edit_fields');

function inventory_series_add_fields()
{
    $brands = get_terms([
        'taxonomy' => 'brand',
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
<?php
}

function inventory_series_edit_fields($term)
{
    $brands = get_terms([
        'taxonomy' => 'brand',
        'hide_empty' => false
    ]);

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
}

//////////////////////////////////////////////////////////
// SAVE META
//////////////////////////////////////////////////////////

add_action('created_series', 'inventory_save_series_meta_ui');
add_action('edited_series', 'inventory_save_series_meta_ui');

function inventory_save_series_meta_ui($term_id)
{
    if (isset($_POST['brand_id'])) {
        update_term_meta($term_id, 'brand_id', (int) $_POST['brand_id']);
    }
}