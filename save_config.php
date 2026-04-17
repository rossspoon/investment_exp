<?php
$config_name = $_POST['config_name'];
$is_default = isset($_POST['is_default']) ? 'true' : 'false';

$database_url = getenv('DATABASE_URL');
if ($database_url) {
    $db_url = parse_url($database_url);
    $conn = pg_connect(sprintf(
        "host=%s port=%s dbname=%s user=%s password=%s sslmode=require",
        $db_url['host'], $db_url['port'],
        ltrim($db_url['path'], '/'),
        $db_url['user'], $db_url['pass']
    ));
} else {
    $conn = pg_connect("host=localhost dbname=rossspoon user=rossspoon");
}

if (!$conn) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// If this config is being set as default, clear any existing default first
if ($is_default === 'true') {
    pg_query($conn, 'UPDATE session_configs SET is_default = FALSE WHERE is_default = TRUE');
}

$result = pg_query_params($conn,
    'INSERT INTO session_configs (
        config_name,
        test_mode, quick_mode, show_instructions, show_practice, show_survey, n_periods,
        std_s_0, std_s_1, mean_s_0, mean_s_1,
        std_n_0, std_n_1, n_firms_0, n_firms_1,
        time_limit_0, time_limit_1, npr_freq_0, npr_freq_1,
        show_history, exp_type, is_default, updated_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,NOW())
    ON CONFLICT (config_name) DO UPDATE SET
        test_mode = $2, quick_mode = $3, show_instructions = $4, show_practice = $5,
        show_survey = $6, n_periods = $7,
        std_s_0 = $8, std_s_1 = $9, mean_s_0 = $10, mean_s_1 = $11,
        std_n_0 = $12, std_n_1 = $13, n_firms_0 = $14, n_firms_1 = $15,
        time_limit_0 = $16, time_limit_1 = $17, npr_freq_0 = $18, npr_freq_1 = $19,
        show_history = $20, exp_type = $21, is_default = $22, updated_at = NOW()',
    [
        $config_name,
        isset($_POST['test_mode'])         ? 'true' : 'false',
        isset($_POST['quick_mode'])        ? 'true' : 'false',
        isset($_POST['show_instructions']) ? 'true' : 'false',
        isset($_POST['show_practice'])     ? 'true' : 'false',
        isset($_POST['show_survey'])       ? 'true' : 'false',
        $_POST['n_periods'],
        $_POST['std_S_0'],
        $_POST['std_S_1'],
        $_POST['mean_S_0'],
        $_POST['mean_S_1'],
        $_POST['std_N_0'],
        $_POST['std_N_1'],
        $_POST['n_firms_0'],
        $_POST['n_firms_1'],
        $_POST['time_limit_0'],
        $_POST['time_limit_1'],
        $_POST['npr_freq_0'],
        $_POST['npr_freq_1'],
        isset($_POST['show_history']) ? 'true' : 'false',
        $_POST['exp_type'],
        $is_default,
    ]
);

header('Content-Type: application/json');
echo json_encode([
    'success' => $result !== false,
    'config_name' => $config_name,
]);
