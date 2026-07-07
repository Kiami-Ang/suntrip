# SunTrip API

## Autenticação

Todas as rotas protegidas requerem header:

```
Authorization: Bearer <token>
```

## Endpoints principais

### Auth
- `POST /api/auth/register` — `{ name, email, phone, password }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me` — utilizador actual

### Carteira
- `GET /api/wallet/balance`
- `POST /api/wallet/deposit` — `{ amount }`
- `POST /api/wallet/transfer` — `{ recipientId, amount, description? }`
- `GET /api/wallet/history`

### QR Code
- `POST /api/qr/generate` — `{ amount, description? }`
- `GET /api/qr/verify/:code`
- `POST /api/qr/pay` — `{ code }`

### Banco
- `POST /api/bank/transfer` — `{ recipientName, bank, iban, reference, amount }`

### Transações
- `GET /api/transactions?type=&status=&page=&limit=`
- `GET /api/transactions/stats`

### Admin (role: admin)
- `GET /api/admin/users`
- `GET /api/admin/transactions`
- `GET /api/admin/payments`

## Socket.io

Conectar com `auth: { token: <jwt> }`.

Eventos:
- `online:update` — lista de utilizadores online
- `heartbeat` — manter presença activa
