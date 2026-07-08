# SunTrip Admin

Painel de administração web da SunTrip (banir, promover, vouchers, auditoria).

## Arranque local

```bash
cd admin
npm install
cp .env.example .env   # se necessário
npm run dev
```

Abre http://localhost:5173 e entra com uma conta **admin**.

Variável `VITE_API_URL` aponta para a API (ex: `https://suntrip.onrender.com/api`).

## Funções

- Dashboard (utilizadores, saldos, volume, bans, vouchers)
- Utilizadores: pesquisar, suspender (temporário), banir (permanente), reactivar, promover/despromover admin, ajustar saldo
- Detalhe de utilizador: verificar email, enviar reset, histórico
- Vouchers: gerar e listar
- Transacções: ledger global
- Auditoria: log de acções admin
