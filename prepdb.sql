DROP TABLE session_configs;
DROP TABLE files;

CREATE TABLE session_configs (
    id SERIAL PRIMARY KEY,
    config_name TEXT NOT NULL UNIQUE,
    std_s_0 TEXT,
    std_s_1 TEXT,
    mean_s_0 TEXT,
    mean_s_1 TEXT,
    std_n_0 TEXT,
    std_n_1 TEXT,
    n_firms_0 INTEGER,
    n_firms_1 INTEGER,
    time_limit_0 INTEGER,
    time_limit_1 INTEGER,
    npr_freq_0 TEXT,
    npr_freq_1 TEXT,
    show_history BOOLEAN,
    exp_type TEXT,
    test_mode BOOLEAN DEFAULT FALSE,
    quick_mode BOOLEAN DEFAULT FALSE,
    show_instructions BOOLEAN DEFAULT TRUE,
    show_practice BOOLEAN DEFAULT TRUE,
    show_survey BOOLEAN DEFAULT TRUE,
    n_periods INTEGER DEFAULT 20,
    is_default BOOLEAN DEFAULT FALSE,
    block0_role TEXT DEFAULT 'T',
    block1_role TEXT DEFAULT 'C',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure only one row can be default at a time
CREATE UNIQUE INDEX one_default ON session_configs (is_default) WHERE is_default = TRUE;

CREATE TABLE files (
    filename TEXT PRIMARY KEY,
    filedata TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
