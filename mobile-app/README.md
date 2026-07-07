# SunTrip Mobile (React Native + Expo)

Aplicativo Android/iOS que consome a **API SunTrip existente** (sem alterar backend).

## Pré-requisitos

- Node.js 18+
- API a correr: `http://<IP-PC>:5000` (pasta `server/`)
- MongoDB activo
- **[Expo Go](https://expo.dev/go) actualizado** na Play Store (suporta **SDK 54**)
- Este projecto usa **Expo SDK 54** (`expo ~54.0.33`)

### Erro de SDK incompatível (52 vs 54)?

| Mensagem | Solução |
|----------|---------|
| Expo Go **SDK 54**, projecto **SDK 52** | `npm install` (projecto já em SDK 54) |
| Falta `expo-asset` | `npx expo install expo-asset expo-font expo-constants` |

```bash
npm list expo --depth=0
# deve mostrar expo@54.x
```

## Configuração

1. Copie o ambiente:

```bash
cd mobile-app
copy .env.example .env
```

2. Edite `.env` com o IP do PC na rede Wi‑Fi:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.123:5000/api
```

| Ambiente | URL exemplo |
|----------|-------------|
| Emulador Android | `http://10.0.2.2:5000/api` |
| Telemóvel físico | `http://192.168.x.x:5000/api` |

3. Instale dependências:

```bash
npm install
```

4. Adicione ícones em `assets/` (`icon.png`, `splash.png`, `adaptive-icon.png`) ou use imagens temporárias 1024×1024.

## Executar

```bash
npm start
```

- Pressione `a` para Android
- Leia o QR com **Expo Go** (mesma rede que o PC)

## Funcionalidades (v1)

- Login / registo Cliente e Motorista (sem foto no registo motorista)
- Dashboard com saldo, estatísticas, Socket.io (online)
- Carteira: depósito, transferência, banco
- QR: gerar (motorista) / ler câmara (cliente)
- Histórico com filtros período e estado
- Perfil e logout

## Contas demo

- `cliente@gmail.com` / `demo123`
- `motorista@gmail.com` / `demo123`

## Publicação Play Store (futuro)

- `eas build --platform android`
- `package`: `ao.suntrip.mobile` (em `app.json`)

## Estrutura

Ver `src/screens`, `src/services`, `src/navigation`, `src/context`.
