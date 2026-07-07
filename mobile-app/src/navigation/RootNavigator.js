import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import TransferScreen from '../screens/TransferScreen';
import BankTransferScreen from '../screens/BankTransferScreen';
import QrGenerateScreen from '../screens/QrGenerateScreen';
import QrScanScreen from '../screens/QrScanScreen';
import Loading from '../components/Loading';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.navyLight },
          headerTintColor: colors.yellow,
          contentStyle: { backgroundColor: colors.navy },
        }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Transfer" component={TransferScreen} options={{ title: 'Transferir' }} />
            <Stack.Screen
              name="BankTransfer"
              component={BankTransferScreen}
              options={{ title: 'Transferência bancária' }}
            />
            <Stack.Screen
              name="QrGenerate"
              component={QrGenerateScreen}
              options={{ title: 'Gerar QR' }}
            />
            <Stack.Screen name="QrScan" component={QrScanScreen} options={{ title: 'Pagar QR' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
