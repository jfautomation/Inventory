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