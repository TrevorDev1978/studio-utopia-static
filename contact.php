<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: contact.html");
    exit;
}

function clean($value) {
    return trim(strip_tags($value));
}

$prenom  = clean($_POST["prenom"] ?? "");
$nom     = clean($_POST["nom"] ?? "");
$email   = filter_var(trim($_POST["email"] ?? ""), FILTER_VALIDATE_EMAIL);
$sujet   = clean($_POST["sujet"] ?? "");
$message = trim($_POST["message"] ?? "");

if (!$prenom || !$nom || !$email || !$sujet || !$message) {
    header("Location: contact.html?status=error");
    exit;
}

$to = "contact@studio-utopia.fr";
$subject = "Nouveau message — " . $sujet;

$body = "Prénom: " . $prenom . "\n";
$body .= "Nom: " . $nom . "\n";
$body .= "Email: " . $email . "\n";
$body .= "Sujet: " . $sujet . "\n\n";
$body .= "Message:\n" . $message . "\n";

$headers = [];
$headers[] = "From: Studio Utopia <contact@studio-utopia.fr>";
$headers[] = "Reply-To: " . $email;
$headers[] = "Content-Type: text/plain; charset=UTF-8";

$success = mail($to, $subject, $body, implode("\r\n", $headers));

if ($success) {
    header("Location: contact.html?status=ok");
} else {
    header("Location: contact.html?status=error");
}
exit;
?>
