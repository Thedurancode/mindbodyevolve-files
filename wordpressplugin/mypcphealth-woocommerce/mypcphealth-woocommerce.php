<?php
/**
 * Plugin Name: MyPCPHealth WooCommerce Integration
 * Description: Integrate WooCommerce with MyPCPHealth API to create patients.
 * Version: 1.0
 * Author: Ed Duran
 * Built for: Erik Ramos
 */

defined('ABSPATH') || exit;

// Include core functions
require_once plugin_dir_path(__FILE__) . 'includes/mypcphealth-functions.php';

// Activation hook
register_activation_hook(__FILE__, 'mypcphealth_activate');
function mypcphealth_activate() {
    // Activation logic here
}

// Admin menu
add_action('admin_menu', 'mypcphealth_create_dashboard_menu');
function mypcphealth_create_dashboard_menu() {
    add_menu_page(
        'MyPCPHealth Dashboard',    // Page title
        'MyPCPHealth',              // Menu title
        'manage_options',           // Capability
        'mypcphealth-dashboard',    // Menu slug
        'mypcphealth_dashboard_page', // Function to display the page
        'dashicons-prescription',   // Icon
        6                           // Position
    );

    add_submenu_page(
        'mypcphealth-dashboard',
        'Settings',
        'Settings',
        'manage_options',
        'mypcphealth-settings',
        'mypcphealth_settings_page'
    );
}

function mypcphealth_dashboard_page() {
    echo '<div class="wrap">';
    echo '<h1>MyPCPHealth Dashboard</h1>';
    mypcphealth_display_dashboard_content();
    echo '</div>';
}

function mypcphealth_settings_page() {
    ?>
    <div class="wrap">
        <h1>MyPCPHealth Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('mypcphealth_settings_group');
            do_settings_sections('mypcphealth-settings');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

add_action('admin_init', 'mypcphealth_register_settings');
function mypcphealth_register_settings() {
    register_setting('mypcphealth_settings_group', 'mypcphealth_account_id');
    register_setting('mypcphealth_settings_group', 'mypcphealth_secret');

    add_settings_section(
        'mypcphealth_settings_section',
        'API Credentials',
        'mypcphealth_settings_section_callback',
        'mypcphealth-settings'
    );

    add_settings_field(
        'mypcphealth_account_id',
        'Account ID',
        'mypcphealth_account_id_callback',
        'mypcphealth-settings',
        'mypcphealth_settings_section'
    );

    add_settings_field(
        'mypcphealth_secret',
        'Secret',
        'mypcphealth_secret_callback',
        'mypcphealth-settings',
        'mypcphealth_settings_section'
    );
}

function mypcphealth_settings_section_callback() {
    echo 'Enter your MyPCPHealth API credentials below:';
}

function mypcphealth_account_id_callback() {
    $account_id = get_option('mypcphealth_account_id');
    echo '<input type="text" name="mypcphealth_account_id" value="' . esc_attr($account_id) . '" />';
}

function mypcphealth_secret_callback() {
    $secret = get_option('mypcphealth_secret');
    echo '<input type="password" name="mypcphealth_secret" value="' . esc_attr($secret) . '" />';
}

// Enqueue admin styles
add_action('admin_enqueue_scripts', 'mypcphealth_admin_styles');
function mypcphealth_admin_styles() {
    wp_enqueue_style('mypcphealth-admin-styles', plugin_dir_url(__FILE__) . 'assets/admin.css');
}

// Add custom checkout field
add_action('woocommerce_after_order_notes', 'mypcphealth_custom_checkout_field');
function mypcphealth_custom_checkout_field($checkout) {
    echo '<div id="mypcphealth_custom_checkout_field"><h2>' . __('Additional Information') . '</h2>';

    woocommerce_form_field('_billing_birth_date', [
        'type' => 'date',
        'class' => ['form-row-wide'],
        'label' => __('Birth Date'),
        'placeholder' => __('YYYY-MM-DD'),
    ], $checkout->get_value('_billing_birth_date'));

    echo '</div>';
}

// Save custom checkout field
add_action('woocommerce_checkout_update_order_meta', 'mypcphealth_checkout_field_update_order_meta');
function mypcphealth_checkout_field_update_order_meta($order_id) {
    if (!empty($_POST['_billing_birth_date'])) {
        update_post_meta($order_id, '_billing_birth_date', sanitize_text_field($_POST['_billing_birth_date']));
    }
}

// Handle order creation
add_action('woocommerce_thankyou', 'mypcphealth_handle_order', 10, 1);
function mypcphealth_handle_order($order_id) {
    $order = wc_get_order($order_id);

    // Create patient in MyPCPHealth
    $patient_response = mypcphealth_create_patient($order);

    if (!$patient_response['success']) {
        mypcphealth_log_error('Patient Creation Error: ' . $patient_response['message']);
    }
}

// Function to display dashboard content
function mypcphealth_display_dashboard_content() {
    echo '<p>Welcome to the MyPCPHealth Dashboard</p>';
}
