<?php
header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? '';

if ($action !== 'report') {
    http_response_code(400);
    echo json_encode(['erro' => 'Ação inválida']);
    exit;
}

$clientes = require __DIR__ . '/../data/clientes.php';
echo json_encode($clientes);
