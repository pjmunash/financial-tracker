// SQLite schema for transactions table
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_type TEXT,
    amount REAL,
    currency TEXT,
    counterparty_name TEXT,
    counterparty_phone TEXT,
    transaction_datetime TEXT,
    balance_after REAL,
    raw_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
