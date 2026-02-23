<?php

/**
 * Plugin Name:       Municipio Search
 * Plugin URI:        https://github.com/helsingborg-stad/municipio-search
 * Description:       Typesense-powered client-side search for Municipio sites.
 * Version:           1.0.0
 * Author:            Municipio
 * License:           MIT
 * Text Domain:       municipio-search
 * Domain Path:       /languages
 */

declare(strict_types=1);

use MunicipioSearch\App;

if (!defined('WPINC')) {
    die();
}

define('MUNICIPIO_SEARCH_PATH', plugin_dir_path(__FILE__));
define('MUNICIPIO_SEARCH_URL', plugins_url('', __FILE__));
define('MUNICIPIO_SEARCH_VIEW_PATH', MUNICIPIO_SEARCH_PATH . 'views/');
define('MUNICIPIO_SEARCH_VERSION', '1.0.0');

if (file_exists(MUNICIPIO_SEARCH_PATH . 'vendor/autoload.php')) {
    require_once MUNICIPIO_SEARCH_PATH . 'vendor/autoload.php';
}

add_action('init', function (): void {
    load_plugin_textdomain('municipio-search', false, plugin_basename(dirname(__FILE__)) . '/languages');
});

new App();
