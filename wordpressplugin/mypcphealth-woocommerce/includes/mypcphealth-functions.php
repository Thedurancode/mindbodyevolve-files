<?php

function mypcphealth_get_headers() {
    return [
        'account-id' => get_option('mypcphealth_account_id'),
        'secret' => get_option('mypcphealth_secret'),
        'Content-Type' => 'application/json'
    ];
}

function mypcphealth_request($endpoint, $data = [], $method = 'POST') {
    $url = 'https://mypcphealth.com/api/v2/' . $endpoint;
    $response = wp_remote_request($url, [
        'method' => $method,
        'headers' => mypcphealth_get_headers(),
        'body' => json_encode($data),
    ]);

    if (is_wp_error($response)) {
        mypcphealth_log_error('MyPCPHealth API Request Error: ' . $response->get_error_message());
        return ['success' => false, 'message' => $response->get_error_message()];
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (!$body['success']) {
        mypcphealth_log_error('MyPCPHealth API Response Error: ' . $body['message']);
    }

    return $body;
}

function mypcphealth_log_error($message) {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log($message);
    }
}

function mypcphealth_create_patient($order) {
    $data = [
        'external_id' => $order->get_id(),
        'first_name' => $order->get_billing_first_name(),
        'last_name' => $order->get_billing_last_name(),
        'phone_number' => $order->get_billing_phone(),
        'birth_date' => get_post_meta($order->get_id(), '_billing_birth_date', true),
    ];
    return mypcphealth_request('patients/create', $data);
}
