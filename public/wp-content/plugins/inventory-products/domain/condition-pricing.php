<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * CONDITION-BASED PRICING
 *
 * Returns the automatic product price percentage
 * for a given condition slug.
 *
 * Returns null when no automatic pricing rule exists.
 *
 * Brand New   = 100%
 * Like New    = 90%
 * Refurbished = 60%
 * Parts Only  = not defined yet
 */
function inventory_get_condition_price_percentage($condition_slug)
{
    $pricing = [
        'brand-new'    => 100,
        'like-new'     => 90,
        'refurbished'  => 60,
    ];

    return $pricing[$condition_slug] ?? null;
}