<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'local' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'root' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          'J|{]IyKx5u?6/Ue;9%mE4aFYn,Vuxkb>K.*jYJaLP/-1~|S[5YJy+}3&uyE:K7lt' );
define( 'SECURE_AUTH_KEY',   'S<!0rC XXE(o=:9IIX$s=5]2,iTXt7Ej@-(6:{,98D_8<cCq:F~uVaGQ?UCUI{n?' );
define( 'LOGGED_IN_KEY',     '`8Iv }~f0ErZg$n Sp9ha6HNTwI&#2L+$6)tL?nrnh^,*bra#W0grvD4)D4v3 #r' );
define( 'NONCE_KEY',         'S8R@Q$E)k;r}]I_o>Wtd)<#S/07LxRUA +lRKo]wdawDm]miYh{Xa-`r2rXu@62<' );
define( 'AUTH_SALT',         'sNy/4O-Zn^iog&:rkfJh[oAcCqG&i??:gM P{M`eV#Q)>xqXI5!C7Ahj|on{uyq4' );
define( 'SECURE_AUTH_SALT',  '+GPydI!jUOtCrM^@A_$[.;bj/ARB_r:Ff=?Xy|l%Ikm},gbPF%``sDB~-IsNz=*;' );
define( 'LOGGED_IN_SALT',    '<:YMtA`|PS1+rNjyXebRyE_?jkji/AqCl,<WLU-soi,#aHal~J<JT5%SwuO8{$e(' );
define( 'NONCE_SALT',        '1Q]>8AGh)CWR4zw{@8BcK 7XBWOG$2VZl*PA*V^h<gLR/?Sf8L{LHG9[:z{ X]r2' );
define( 'WP_CACHE_KEY_SALT', '0-fwt<s<Wp=x :a|TyV$|0T5GZG!DhYSLEbht+AqUrmE}ki5#[Y3mp`*|>qmI5s%' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'WP_ENVIRONMENT_TYPE', 'local' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
