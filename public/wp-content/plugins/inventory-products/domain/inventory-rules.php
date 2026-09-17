<?php

if (!defined('ABSPATH')) {
    exit;
}

//////////////////////////////////////////////////////////
// INVENTORY BUSINESS RULES
//////////////////////////////////////////////////////////

/**
 * STATUS RULES
 */
function inventory_normalize_status($status)
{
    $valid = ['active', 'sold', 'archived'];

    return in_array($status, $valid, true) ? $status : 'active';
}

/**
 * QUANTITY RULE
 */
function inventory_calculate_quantity($status)
{
    return $status === 'active' ? 1 : 0;
}

/**
 * SERIAL VALIDATION RULE
 */
function inventory_is_valid_serial($serial)
{
    return !empty(trim((string) $serial));
}

/**
 * DUPLICATE RULE WRAPPER
 */
function inventory_can_create_meta($meta_key, $value, $exclude_id = 0)
{
    if (!$value) {
        return true;
    }

    return !inventory_meta_exists($meta_key, $value, $exclude_id);
}

/**
 * PART → BRAND RULE
 */
function inventory_get_brand_from_part($part_id)
{
    return (int) get_term_meta($part_id, 'brand_id', true);
}

/**
 * PART → CATEGORY RULE
 */
function inventory_get_category_from_part($part_id)
{
    return (int) get_term_meta($part_id, 'category_id', true);
}

/**
 * SERIES VALIDATION RULE
 */
function inventory_is_series_allowed_for_brand($series_id, $brand_id)
{
    if (!$brand_id) {
        return true;
    }

    $series_brand = (int) get_term_meta($series_id, 'brand_id', true);

    return $series_brand === $brand_id;
}

/**
 * AUTOMATIC PRODUCT PRICE
 *
 * Calculates product price from:
 * Part Base Price × Condition Price %
 *
 * Returns null when automatic pricing is not available.
 */
function inventory_calculate_product_price($part_id, $condition_id)
{
    $part_id = (int) $part_id;
    $condition_id = (int) $condition_id;

    if (!$part_id || !$condition_id) {
        return null;
    }

    // Get Part base price
    $base_price = (float) get_term_meta(
        $part_id,
        'base_price',
        true
    );

    if ($base_price <= 0) {
        return null;
    }

    // Get Condition
    $condition = get_term(
        $condition_id,
        'condition'
    );

    if (!$condition || is_wp_error($condition)) {
        return null;
    }

    // Get automatic pricing percentage
    $percentage = inventory_get_condition_price_percentage(
        $condition->slug
    );

    // No automatic pricing rule exists
    if ($percentage === null) {
        return null;
    }

    return round(
        $base_price * ($percentage / 100),
        2
    );
}

/**
 * PRODUCT PRICING MODE
 *
 * Automatic is the default.
 * Manual is the only alternative.
 */
function inventory_normalize_price_mode($price_mode)
{
    $valid = ['automatic', 'manual'];

    return in_array($price_mode, $valid, true)
        ? $price_mode
        : 'automatic';
}