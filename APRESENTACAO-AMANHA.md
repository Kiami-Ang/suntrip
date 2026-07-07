# SunTrip — Guia rápido para amanhã

## Arranque em 1 clique

1. Duplo-clique em **`INICIAR-SUNTRIP.bat`** (na pasta SunTrip)
2. Espere abrir **2 janelas pretas** + o browser
3. **NÃO FECHE** as janelas pretas durante a apresentação

Se não abrir: espere 20 segundos e vá a **http://localhost:3000**

---

## Links

| Onde | Link |
|------|------|
| Seu PC | http://localhost:3000 |
| Telemóveis (mesma Wi-Fi) | http://192.168.1.123:3000 |
| Testar se API OK | http://localhost:5000/api/health |

---

## Contas para demonstrar

| Email | Password | Uso |
|-------|----------|-----|
| demo@suntrip.ao | demo123 | Motorista / utilizador |
| admin@suntrip.ao | admin123 | Painel admin |

Registe contas novas nos telemóveis dos colegas.

---

## Roteiro de demonstração (5 min)

1. **Login** com demo@suntrip.ao
2. **Dashboard** — mostrar saldo e botões
3. **Adicionar saldo** (Carteira → Adicionar)
4. **Gerar QR** — mostrar código **ST-...** ao público
5. **Outro telemóvel** — Ler QR → colar código → pagar
6. **Admin** — admin@suntrip.ao → ver transações

---

## Se algo falhar

### Site não abre
```powershell
# Feche tudo e execute de novo INICIAR-SUNTRIP.bat
```

### Porta ocupada
O ficheiro INICIAR-SUNTRIP.bat já mata processos antigos.

### MongoDB
- Win + R → `services.msc` → **MongoDB Server** → Iniciar

### Registo no telemóvel falha
- Confirme que as **2 janelas** estão abertas
- Teste no telemóvel: http://192.168.1.123:3000/api/health

### Câmara no telemóvel
Use o **código ST-** manual (não a câmara).

---

## Na escola (dados móveis)

1. Hotspot do seu telemóneo
2. Portátil + telemóveis ligados ao hotspot
3. INICIAR-SUNTRIP.bat
4. `ipconfig` → novo IP → partilhar http://NOVO-IP:3000

---

## O que foi corrigido hoje

- Ícones PWA que impediam o site de arrancar no Windows
- Site (porta 3000) não estava a correr
- API no telemóvel (proxy automático)
- MongoDB sem transações (transferências funcionam)
- Script INICIAR-SUNTRIP.bat automático
