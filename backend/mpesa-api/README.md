# M-PESA Transaction Ingestion API

This Node.js Express app provides a secure REST endpoint for ingesting M-PESA transaction data from Automate flows.

## Features
- API key authentication
- JSON schema validation
- Duplicate prevention
- SQLite database storage
- Logging

## Usage
1. Deploy to your domain or GitHub (e.g., https://yourdomain.com)
2. Configure Automate HTTP POST to https://yourdomain.com/api/mpesa
3. Set your API key in Automate and backend

## Endpoint
- POST /api/mpesa

## Security
- HTTPS only
- API key required
- Strict schema validation

## Deployment
- Clone repo
- Run `npm install`
- Start with `npm start`

## Example Automate HTTP Request
```
POST https://yourdomain.com/api/mpesa
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_API_KEY
Body:
  { ...parsed transaction JSON... }
```

## Database
- SQLite file: transactions.db

## License
MIT
