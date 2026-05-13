<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$file = 'members.json';

// Si no existe, lo creamos con datos vacos o iniciales
if (!file_exists($file)) {
    $initialData = [
        ["email" => "kaimartinez48@gmail.com", "name" => "Kai Martinez", "status" => "JOINED", "dateAdded" => "11/05/2026", "role" => "Can View & Add Members"],
        ["email" => "anastasia.gestion8@gmail.com", "name" => "ANASTASIA ILIEVA", "status" => "JOINED", "dateAdded" => "11/05/2026", "role" => "Can View & Add Members"],
        ["email" => "boyannikolov13@gmail.com", "name" => "BoyanBiserovNikolov", "status" => "JOINED", "dateAdded" => "11/05/2026", "role" => "Can View & Add Members"],
        ["email" => "fernando.ramirezhernando@hotmail.com", "name" => "Fernando Ramirez", "status" => "INVITED", "dateAdded" => "05/05/2026", "role" => "Can View & Add Members"],
        ["email" => "victor_sace_9@hotmail.com", "name" => "victor manuel gil rosal", "status" => "JOINED", "dateAdded" => "05/05/2026", "role" => "Can View & Add Members"],
        ["email" => "mendisalestaskers@gmail.com", "name" => "Alejandro Xabier Salvador", "status" => "JOINED", "dateAdded" => "05/05/2026", "role" => "Can View & Add Members"],
        ["email" => "jjgximo090171@gmail.com", "name" => "Joaquin JuliGmez", "status" => "JOINED", "dateAdded" => "05/05/2026", "role" => "Can View & Add Members"],
        ["email" => "ismaelserrano0806@gmail.com", "name" => "Ismael serrano", "status" => "JOINED", "dateAdded" => "05/05/2026", "role" => "Can View & Add Members"],
        ["email" => "r.rodriguez1985@hotmail.com", "name" => "Roberto Rodriguez Mung...", "status" => "JOINED", "dateAdded" => "05/05/2026", "role" => "Can View & Add Members"],
        ["email" => "elena.blm@hotmail.com", "name" => "Elena Blas", "status" => "JOINED", "dateAdded" => "05/05/2026", "role" => "Can View & Add Members"],
        ["email" => "javij.quintana@gmail.com", "name" => "Javier Quintana", "status" => "JOINED", "dateAdded" => "05/05/2026", "role" => "Can View & Add Members"]
    ];
    file_put_contents($file, json_encode($initialData));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo file_get_contents($file);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (isset($data['action']) && $data['action'] === 'save') {
        if (isset($data['members'])) {
            file_put_contents($file, json_encode($data['members']));
            echo json_encode(["status" => "success"]);
            exit;
        }
    }
    
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}
?>
