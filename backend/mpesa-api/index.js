const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const Ajv = require('ajv');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'b7f3c2e1-9a4d-4e8b-8c2a-7f6d5e4c3b2a';
const DB_FILE = 'transactions.db';

app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'https://pjmunash.github.io',
    'https://financial-trackeing-system.onrender.com'
  ]
}));

// SQLite setup
const db = new sqlite3.Database(DB_FILE);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
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
  )`);
});

// JSON schema validation
const ajv = new Ajv();
const schema = {
  type: 'object',
  properties: {
    transaction_type: { type: 'string', enum: ['credit', 'debit'] },
    amount: { type: 'number' },
    currency: { type: 'string' },
    counterparty_name: { type: 'string' },
    counterparty_phone: { type: 'string' },
    transaction_datetime: { type: 'string' },
    balance_after: { type: 'number' },
    raw_message: { type: 'string' }
  },
  required: ['transaction_type', 'amount', 'currency', 'counterparty_name', 'counterparty_phone', 'transaction_datetime', 'balance_after', 'raw_message']
};
const validate = ajv.compile(schema);

// API key middleware

// POST /api/mpesa
app.post('/api/mpesa', (req, res) => {
  const data = req.body;
  if (!validate(data)) {
    return res.status(400).json({ error: 'Invalid payload', details: validate.errors });
  }

  // Duplicate prevention: check by transaction_datetime, amount, counterparty_phone
  db.get(
    `SELECT id FROM transactions WHERE transaction_datetime = ? AND amount = ? AND counterparty_phone = ?`,
    [data.transaction_datetime, data.amount, data.counterparty_phone],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (row) return res.json({ status: 'duplicate', transaction_id: row.id });

      db.run(
        `INSERT INTO transactions (transaction_type, amount, currency, counterparty_name, counterparty_phone, transaction_datetime, balance_after, raw_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.transaction_type,
          data.amount,
          data.currency,
          data.counterparty_name,
          data.counterparty_phone,
          data.transaction_datetime,
          data.balance_after,
          data.raw_message
        ],
        function (err) {
          if (err) return res.status(500).json({ error: 'DB error' });
          res.json({ status: 'success', transaction_id: this.lastID });
        }
      );
    }
  );
});

// GET /api/transactions - return latest 20 transactions
app.get('/api/transactions', (req, res) => {
  db.all(
    `SELECT * FROM transactions ORDER BY transaction_datetime DESC LIMIT 20`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  // Serve status UI
  app.get('/status', (req, res) => {
    res.sendFile(__dirname + '/status.html');
  });
  console.log(`M-PESA API running on port ${PORT}`);
});
