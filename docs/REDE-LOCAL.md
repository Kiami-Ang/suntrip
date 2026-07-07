# Testar SunTrip em vários dispositivos (mesma Wi‑Fi)

## Requisitos

- PC com o projeto a correr
- Telemóvel/tablet/outro PC na **mesma rede Wi‑Fi**
- Firewall do Windows a permitir portas **3000** e **5000**

---

## Passo 1 — Descobrir o IP do seu PC

No **PowerShell**:

```powershell
ipconfig
```

Procure **IPv4** na ligação Wi‑Fi, por exemplo:

```text
Endereço IPv4. . . . . . . . : 192.168.1.105
```

Guarde este número — é o link para os outros dispositivos.

---

## Passo 2 — Arrancar servidor e site (modo rede)

**Terminal 1 — API:**

```powershell
cd "c:\Users\FARIA DIOGO\Desktop\SunTrip\server"
npm run dev
```

Ao iniciar, o terminal mostra algo como:

```text
Rede:    http://192.168.1.105:5000
Site:    http://192.168.1.105:3000
```

**Terminal 2 — Site:**

```powershell
cd "c:\Users\FARIA DIOGO\Desktop\SunTrip\client"
npm run dev
```

O comando `npm run dev` já usa `-H 0.0.0.0` para aceitar ligações da rede.

---

## Passo 3 — Abrir noutros dispositivos

No telemóvel ou outro PC, abra o browser e vá a:

```text
http://192.168.1.105:3000
```

(substitua pelo **seu** IP)

### Contas para testar em paralelo

| Dispositivo | Conta | Password |
|-------------|-------|----------|
| PC | demo@suntrip.ao | demo123 |
| Telemóvel 1 | admin@suntrip.ao | admin123 |
| Telemóvel 2 | Registar nova conta | — |

Assim pode testar: um gera QR, outro paga; transferências entre utilizadores; utilizadores online.

---

## Passo 4 — Firewall Windows (se não abrir no telemóvel)

1. **Definições** → **Privacidade e segurança** → **Firewall do Windows**
2. **Permitir uma aplicação** → permita **Node.js** em redes **Privadas**
3. Ou crie regras de entrada para portas **TCP 3000** e **5000**

Teste no telemóvel: `http://SEU-IP:5000/api/health` — deve responder `{"status":"ok"}`.

---

## Como funciona tecnicamente

- O site no telemóvel usa `http://IP-DO-PC:3000` e a API passa pelo **mesmo endereço** (`/api` → proxy para o servidor no PC)
- **Não** use `localhost` no `.env.local` do client ao testar em telemóveis
- Socket.io (utilizadores online) ainda usa a porta **5000** no IP do PC

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Página não abre no telemóvel | Mesma Wi‑Fi? Firewall? IP correcto? |
| Login falha na rede | API a correr? Teste `/api/health` no browser do telemóvel |
| QR / câmara | No telemóvel use HTTPS só se tiver certificado; em HTTP local a câmara pode pedir permissão |
| Dados não sincronizam | MongoDB a correr no PC |

---

## Acesso fora de casa (opcional)

Para testar fora da rede local use [ngrok](https://ngrok.com) ou deploy (Vercel + MongoDB Atlas). Para demonstração em sala, a rede Wi‑Fi local é suficiente.
