<?php
header('Content-Type: application/json');

$clientes = require __DIR__ . '/../data/clientes.php';

$action = $_GET['action'] ?? '';

if ($action === 'report') {
    echo json_encode($clientes);
    exit;
}

// Nenhum retorno se action for diferente
