# Apresentar SunTrip na escola (dados móveis, vários dispositivos)

Na escola **não estará na sua Wi‑Fi de casa**. Há **2 formas** que funcionam bem.

---

## Opção 1 — Hotspot do telemóvel (recomendada)

Todos os aparelhos usam a **mesma rede** criada pelo seu telemóvel. O SunTrip continua a correr no **seu portátil**.

### Passos

1. **No telemóvel:** Definições → Hotspot / Partilha de internet → **Ligar**
2. **No portátil:** Ligar Wi‑Fi ao hotspot do telemóvel (usa os seus dados móveis)
3. **Noutros telemóveis da turma:** Ligar ao **mesmo** hotspot
4. **No portátil**, arrancar SunTrip:
   ```powershell
   cd server
   npm run dev

   cd client
   npm run dev
   ```
5. **Descobrir IP do portátil** (ligado ao hotspot):
   ```powershell
   ipconfig
   ```
   Procure IPv4 na ligação Wi‑Fi (ex.: `192.168.43.1` ou `192.168.137.x`)

6. **Partilhar este link** com a turma:
   ```text
   http://IP-DO-PORTATIL:3000
   ```
   Exemplo: `http://192.168.43.187:3000`

### Contas para demonstrar

| Dispositivo | Conta |
|-------------|--------|
| Seu telemóvel | demo@suntrip.ao / demo123 |
| Colega 1 | admin@suntrip.ao / admin123 |
| Colega 2 | Registar nova conta |

### Vantagens

- Simples, sem instalar mais nada
- Funciona com dados móveis
- MongoDB no portátil (já configurado)

### Atenção

- Mantenha o **portátil ligado** e as **2 janelas** (API + site) abertas
- Hotspot com **muitos telemóveis** pode ficar lento — para 2–4 dispositivos é ideal
- Carregador do portátil na apresentação

---

## Opção 2 — Internet pública (ngrok)

Use se **não puder** pôr todos no mesmo hotspot (ex.: cada um só com os seus dados).

Expõe o SunTrip na internet com um link **https://**. Qualquer um entra de qualquer rede.

### 1. Instalar ngrok

- Conta grátis: https://ngrok.com
- Descarregar ngrok para Windows
- Configurar token: `ngrok config add-authtoken SEU_TOKEN`

### 2. Arrancar SunTrip no portátil

```powershell
cd server
npm run dev

cd client
npm run dev
```

### 3. Abrir 2 túneis (2 terminais extra)

**Terminal A — API:**
```powershell
ngrok http 5000
```
Copie o URL `https://xxxx.ngrok-free.app`

**Terminal B — Site:**
```powershell
ngrok http 3000
```
Copie o URL `https://yyyy.ngrok-free.app`

### 4. Configurar URLs

**`client/.env.local`** (criar ou editar):
```env
NEXT_PUBLIC_API_URL=https://xxxx.ngrok-free.app/api
NEXT_PUBLIC_SOCKET_URL=https://xxxx.ngrok-free.app
```

**`server/.env`** — adicionar o URL do site:
```env
CLIENT_URL=https://yyyy.ngrok-free.app
```

### 5. Reiniciar client e server

```powershell
# Parar (Ctrl+C) e voltar a correr npm run dev nos dois
```

### 6. Partilhar com a turma

```text
https://yyyy.ngrok-free.app
```

Todos abrem esse link no telemóvel (com **dados móveis** ou Wi‑Fi da escola).

### Vantagens

- Cada pessoa na sua rede
- **HTTPS** → câmara no telemóvel pode funcionar

### Desvantagens

- Precisa de internet no portátil
- URLs ngrok gratuitas mudam cada vez que reinicia
- Conta ngrok gratuita tem limites

---

## Comparativo rápido

| | Hotspot | ngrok |
|---|---------|--------|
| Dificuldade | Fácil | Média |
| Mesma rede? | Sim | Não |
| Link fixo? | IP muda pouco | URL muda ao reiniciar |
| Câmara no telemóvel | Use código ST- | Pode funcionar (HTTPS) |
| Dados móveis | Seu telemóvel gasta mais | Portátil precisa net |

---

## Checklist antes da apresentação

- [ ] MongoDB a correr no portátil (Serviços → MongoDB Server)
- [ ] `npm run seed` já executado (contas demo)
- [ ] Testar transferência ou QR em casa
- [ ] Bateria + carregador do portátil
- [ ] Anotar link (IP ou ngrok) num slide/papel
- [ ] Plano B: código **ST-** manual se a câmara falhar

---

## Perguntas frequentes

**Preciso de internet na escola?**  
- Hotspot: só dados no **seu** telemóvel.  
- ngrok: portátil precisa de Wi‑Fi da escola ou hotspot.

**O projeto fica online para sempre?**  
Não. Só enquanto o portátil e os túneis/servidores estiverem ligados. Para produção use MongoDB Atlas + Vercel + Render.

**Firewall?**  
No hotspot, desative temporariamente ou permita Node.js nas portas 3000 e 5000.
