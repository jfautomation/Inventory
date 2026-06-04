<?php

if (!defined('ABSPATH')) exit;

//////////////////////////////////////////////////////////
// PART STOCK ENGINE
// - recalculation
// - dirty tracking
// - stock aggregation
//////////////////////////////////////////////////////////

/**
 * MARK PART DIRTY
 */
function inventory_mark_part_dirty($part_id)
{
    update_term_meta((int) $part_id, 'part_stock_dirty', 1);
}

//////////////////////////////////////////////////////////
// CORE RECALCULATION
//////////////////////////////////////////////////////////

function inventory_recalculate_part_stock($part_id)
{
    $part_id = (int) $part_id;
    if (!$part_id) return;

    error_log("🔥 RECALC RUNNING for part: " . $part_id);

    $query = new WP_Query([
        'post_type'      => 'product',
        'posts_per_page' => -1,
        'post_status'    => 'any',
        'tax_query'      => [
            [
                'taxonomy' => 'part',
                'field'    => 'term_id',
                'terms'    => $part_id,
            ]
        ],
        'meta_query' => [
            [
                'key'     => 'inventory_status',
                'value'   => 'active',
                'compare' => '='
            ]
        ]
    ]);

    $by_condition = [];

    foreach ($query->posts as $post) {

        $terms = wp_get_post_terms($post->ID, 'condition');

        $condition = (!empty($terms) && !is_wp_error($terms))
            ? $terms[0]->name
            : 'Unknown';

        $by_condition[$condition] = ($by_condition[$condition] ?? 0) + 1;
    }

    update_term_meta($part_id, 'part_stock', $by_condition);
    update_term_meta($part_id, 'part_stock_last_run', current_time('mysql'));

    // clear dirty flag after successful recalculation
    delete_term_meta($part_id, 'part_stock_dirty');
}

//////////////////////////////////////////////////////////
// DIRTY PROCESSOR (THIS WAS MISSING IN PRACTICE)
//////////////////////////////////////////////////////////

function inventory_process_dirty_parts()
{
    $parts = get_terms([
        'taxonomy'   => 'part',
        'hide_empty' => false,
        'meta_query' => [
            [
                'key'   => 'part_stock_dirty',
                'value' => 1
            ]
        ]
    ]);

    if (empty($parts) || is_wp_error($parts)) return;

    foreach ($parts as $part) {
        inventory_recalculate_part_stock($part->term_id);
    }
}

//////////////////////////////////////////////////////////
// OPTIONAL INCREMENT
//////////////////////////////////////////////////////////

function inventory_increment_part_stock($part_id, $condition, $delta = 1)
{
    $part_id = (int) $part_id;
    if (!$part_id) return;

    $stock = get_term_meta($part_id, 'part_stock', true);

    if (!is_array($stock)) {
        $stock = [];
    }

    $stock[$condition] = ($stock[$condition] ?? 0) + $delta;

    if ($stock[$condition] <= 0) {
        unset($stock[$condition]);
    }

    update_term_meta($part_id, 'part_stock', $stock);
}

//////////////////////////////////////////////////////////
// EVENT HOOKS (ONLY MARK DIRTY HERE)
//////////////////////////////////////////////////////////

add_action('save_post_product', function ($post_id, $post, $update) {

    if (empty($post) || $post->post_type !== 'product') return;
    if (wp_is_post_revision($post_id)) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    $parts = wp_get_post_terms($post_id, 'part');

    if (empty($parts) || is_wp_error($parts)) return;

    foreach ($parts as $part) {
        inventory_mark_part_dirty($part->term_id);
    }

}, 10, 3);

add_action('before_delete_post', function ($post_id) {

    $post = get_post($post_id);

    if (empty($post) || $post->post_type !== 'product') return;

    $parts = wp_get_post_terms($post_id, 'part');

    if (empty($parts) || is_wp_error($parts)) return;

    foreach ($parts as $part) {
        inventory_mark_part_dirty($part->term_id);
    }

});

add_action('set_object_terms', function ($object_id, $terms, $tt_ids, $taxonomy, $append, $old_tt_ids) {

    if ($taxonomy !== 'part') return;

    $all_part_ids = array_unique(array_merge((array) $tt_ids, (array) $old_tt_ids));

    foreach ($all_part_ids as $part_id) {
        inventory_mark_part_dirty((int) $part_id);
    }

}, 10, 6);

//////////////////////////////////////////////////////////
// AUTO RUN (THIS FIXES YOUR "WHY IS IT ALWAYS 0?")
//////////////////////////////////////////////////////////

add_action('shutdown', function () {
    inventory_process_dirty_parts();
});