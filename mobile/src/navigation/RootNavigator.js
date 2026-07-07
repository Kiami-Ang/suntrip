import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import Loading from '../components/Loading';
import colors from '../theme/colors';

import DepositScreen from '../screens/DepositScreen';
import TransferScreen from '../screens/TransferScreen';
import QrGenerateScreen from '../screens/qr/QrGenerateScreen';
import QrScanScreen from '../screens/qr/QrScanScreen';
import SetPinScreen from '../screens/SetPinScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.navy, card: colors.navy, text: colors.white },
};

export default function RootNavigator() {
  const { isAuthenticated, booting } = useAuth();

  if (booting) return <Loading label="A iniciar SunTrip..." />;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.white,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.navy },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Deposit" component={DepositScreen} options={{ title: 'Carregar saldo' }} />
            <Stack.Screen name="Transfer" component={TransferScreen} options={{ title: 'Transferir' }} />
            <Stack.Screen name="QrGenerate" component={QrGenerateScreen} options={{ title: 'Receber com QR' }} />
            <Stack.Screen
              name="QrScan"
              component={QrScanScreen}
              options={{ title: 'Pagar com QR', presentation: 'fullScreenModal' }}
            />
            <Stack.Screen name="SetPin" component={SetPinScreen} options={{ title: 'PIN de pagamento' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
