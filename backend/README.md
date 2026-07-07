# SunTrip API (v2)

Backend da SunTrip — carteira digital e pagamentos de transporte em Angola.

**Stack:** Node.js · Express · MongoDB (Mongoose) · JWT · Socket.io

## Princípios fintech

- **Dinheiro em cêntimos** (inteiros) — sem erros de vírgula flutuante.
- **Operações atómicas** — débito só ocorre com saldo suficiente; nunca fica negativo.
- **Compensação automática** — se um pagamento falha a meio, o valor é devolvido.
- **Idempotência** — cada pagamento tem uma `reference` única (não paga duas vezes).
- **PIN de pagamento** — transferências e pagamentos QR exigem PIN (4-6 dígitos).
- **Ledger de auditoria** — cada movimento fica registado (débito + crédito).
- **Rate limiting** e validação forte (email de domínios permitidos, telemóvel angolano 9xxxxxxxx).

## Como correr localmente

```bash
cd backend
npm install
cp .env.example .env      # depois edite MONGODB_URI e os segredos JWT
npm run seed              # cria contas demo (senha 123456, PIN 1234)
npm run dev
```

API em `http://localhost:5000`. Health check: `GET /api/health`.

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register/client` | Registo de cliente |
| POST | `/api/auth/register/driver` | Registo de motorista |
| POST | `/api/auth/login` | Login (devolve access + refresh token) |
| POST | `/api/auth/refresh` | Novo access token |
| GET  | `/api/auth/me` | Perfil autenticado |
| POST | `/api/auth/pin` | Definir/alterar PIN |
| GET  | `/api/wallet/balance` | Saldo |
| POST | `/api/wallet/deposit` | Carregar saldo |
| POST | `/api/wallet/transfer` | Transferência P2P (PIN) |
| POST | `/api/qr/generate` | Gerar QR de cobrança |
| GET  | `/api/qr/verify/:code` | Verificar QR |
| POST | `/api/qr/pay` | Pagar QR (PIN) |
| GET  | `/api/transactions` | Histórico (filtros: period, status, type) |
| GET  | `/api/transactions/stats` | Estatísticas |
| GET  | `/api/dashboard` | Resumo do dashboard |
| PUT  | `/api/users/profile` | Actualizar perfil |
| GET  | `/api/users/search?q=` | Procurar destinatário |

## Deploy (Render + MongoDB Atlas)

1. Criar cluster grátis no **MongoDB Atlas** e obter o `MONGODB_URI`.
2. No **Render**, criar um *Web Service* a partir deste repositório (`render.yaml` já configurado).
3. Definir a variável `MONGODB_URI` no Render. Os segredos JWT são gerados automaticamente.
4. A API fica em `https://suntrip-api.onrender.com`.
