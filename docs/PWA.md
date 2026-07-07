# Instalar SunTrip como app (PWA)

## Android (Chrome)

1. Abra o SunTrip no browser
2. Aparece o banner **Instalar SunTrip** → toque em **Instalar aplicação**
3. Ou: menu ⋮ → **Instalar aplicação** / **Adicionar ao ecrã inicial**

## iPhone (Safari)

1. Abra o SunTrip no **Safari** (não Chrome)
2. Toque em **Partilhar** (ícone de quadrado com seta)
3. **Adicionar ao ecrã principal** → Adicionar

## Notas

- Em **http://192.168.x.x** (rede local) o botão automático pode não aparecer no Android — use o menu do browser ou Safari no iPhone
- Com **HTTPS** (ngrok) a instalação funciona melhor
- A app abre em ecrã completo, sem barra do browser
- A API continua a precisar do servidor no PC (não é app offline completa)

## Reiniciar após alterações PWA

```powershell
cd client
npm run dev
```

No telemóvel: feche a app instalada e volte a abrir, ou reinstale.
