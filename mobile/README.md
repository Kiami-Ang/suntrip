# SunTrip Mobile

App Android (React Native + Expo SDK 57) — carteira digital e pagamentos de transporte em Angola.

## Funcionalidades

- Login e registo (Cliente / Motorista) com validação (email, telemóvel 9xxxxxxxx)
- Dashboard com saldo, estatísticas e movimentos recentes
- Carteira: carregar saldo, ver saldo (com ocultar)
- Transferências P2P (procura de destinatário + PIN)
- QR Code: gerar cobrança (receber) e ler com a câmara (pagar)
- Histórico com filtros (período e estado)
- Perfil + definição de PIN de pagamento
- Tempo real (Socket.io): contagem de utilizadores online e notificação ao receber dinheiro
- JWT guardado em AsyncStorage, com renovação automática do token

## Configuração

Cria um ficheiro `.env` (baseado em `.env.example`):

```
EXPO_PUBLIC_API_URL=http://192.168.1.10:5000   # dev (mesmo Wi-Fi que o PC)
# ou, em produção:
# EXPO_PUBLIC_API_URL=https://suntrip-api.onrender.com
```

Para descobrir o IP local do PC: `ipconfig` (procura o IPv4).

## Correr em desenvolvimento

```bash
cd mobile
npm install
npx expo start
```

Lê o QR com a app **Expo Go** (mesmo Wi-Fi). Nota: o Expo Go tem de ser compatível com o SDK 57.

## Gerar APK real (EAS Build)

```bash
npm install -g eas-cli
eas login                 # conta grátis em expo.dev
eas build -p android --profile preview
```

No fim, o EAS dá um **link para descarregar o `.apk`**. Instala-o directamente no telemóvel — não precisa de Expo Go.

> Antes do build, garante que `EXPO_PUBLIC_API_URL` aponta para a API na nuvem (Render), para o APK funcionar em qualquer lado.

## Estrutura

```
src/
├── components/   # UI reutilizável (Button, Input, Card, BalanceCard...)
├── context/      # AuthContext (sessão)
├── hooks/        # useSocket
├── navigation/   # AuthStack, MainTabs, RootNavigator
├── screens/      # ecrãs (auth/, qr/, Dashboard, Wallet, ...)
├── services/     # api (axios+JWT), socket, storage
├── theme/        # cores, espaçamentos
└── utils/        # format, validation
```
