# SunTrip

Plataforma fintech angolana de pagamentos digitais para táxis e transporte urbano.

## Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, JWT, Socket.io
- **Moeda:** Kwanza (Kz)

## Estrutura

```
suntrip/
├── client/      # Next.js (porta 3000)
├── server/      # Express API (porta 5000)
├── mobile-app/  # React Native + Expo (Android/iOS)
├── shared/      # Constantes partilhadas
└── docs/        # Documentação
```

### App mobile

Ver **[mobile-app/README.md](mobile-app/README.md)** — consome a mesma API via `EXPO_PUBLIC_API_URL`.

## Pré-requisitos

- Node.js 18+
- MongoDB em execução localmente (ou URI remota no `.env`)

## Instalação (Windows — mais fácil)

1. Instale [Node.js LTS](https://nodejs.org) e **MongoDB**
2. Duplo-clique em **`install.bat`** (instala dependências + contas demo)
3. Duplo-clique em **`start-suntrip.bat`** (abre API + site + browser)

**URL no PC:** http://localhost:3000  
**URL no telemóvel (mesma Wi‑Fi):** http://192.168.1.123:3000

> Se `npm` não for reconhecido no PowerShell, use os ficheiros `.bat` — eles usam o caminho completo do Node.

### Instalação manual (terminal)

```powershell
# Adicione Node ao PATH desta sessão (se npm der erro):
$env:Path = "C:\Program Files\nodejs;" + $env:Path

cd server
npm install
npm run seed
npm run dev

# Outro terminal:
cd client
npm install
npm run dev
```

Aceda a **http://localhost:3000**

### O site não abre?

| Verificação | O que fazer |
|-------------|-------------|
| Janelas abertas? | Precisa de **2 janelas** (API + Site) — não feche |
| MongoDB | Serviço "MongoDB Server" deve estar **A executar** |
| Teste API | Abra http://localhost:5000/api/health → deve mostrar `"status":"ok"` |
| Teste site | Abra http://localhost:3000 (não https) |
| `npm` não encontrado | Use `start-suntrip.bat` em vez do PowerShell |

### Instalar como app no telemóvel (PWA)

Guia: **[docs/PWA.md](docs/PWA.md)** — banner «Instalar SunTrip» ou Adicionar ao ecrã principal (iPhone/Android).

### Apresentação na escola (dados móveis)

Guia completo: **[docs/APRESENTACAO-ESCOLA.md](docs/APRESENTACAO-ESCOLA.md)**

- **Mais fácil:** hotspot do telemóvel → todos ligam → `http://IP-DO-PC:3000`
- **Alternativa:** ngrok (link público https para qualquer rede)

### Testar em 2–3 dispositivos (mesma Wi‑Fi)

1. Descubra o IP do PC: `ipconfig` → IPv4 (ex.: `192.168.1.105`)
2. Arranque `npm run dev` no server e no client
3. No telemóvel abra: `http://192.168.1.105:3000`
4. Guia completa: [docs/REDE-LOCAL.md](docs/REDE-LOCAL.md)

## Contas demo (após seed)

| Email | Password | Role |
|-------|----------|------|
| demo@suntrip.ao | demo123 | user |
| admin@suntrip.ao | admin123 | admin |

## Funcionalidades

- Autenticação JWT (registo, login, logout, sessão persistente)
- Carteira virtual (depósito, transferência, histórico)
- Pagamentos QR Code (gerar, ler, confirmar)
- Transferência bancária (IBAN, banco, referência)
- Dashboard com estatísticas e utilizadores online (Socket.io)
- Painel administrativo

## API

Base URL: `http://localhost:5000/api`

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/register | Registo |
| POST | /auth/login | Login |
| GET | /auth/me | Perfil (JWT) |
| GET | /dashboard | Dashboard |
| POST | /wallet/deposit | Depósito |
| POST | /wallet/transfer | Transferência interna |
| POST | /qr/generate | Gerar QR |
| POST | /qr/pay | Pagar QR |
| POST | /bank/transfer | Transferência bancária |
| GET | /admin/users | Admin: utilizadores |

## Licença

Projeto de demonstração — SunTrip © 2026
