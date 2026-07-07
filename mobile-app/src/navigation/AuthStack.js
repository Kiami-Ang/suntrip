import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterChooseScreen from '../screens/RegisterChooseScreen';
import RegisterClientScreen from '../screens/RegisterClientScreen';
import RegisterDriverScreen from '../screens/RegisterDriverScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.yellow,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.navy },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
      <Stack.Screen
        name="RegisterChoose"
        component={RegisterChooseScreen}
        options={{ title: 'Criar conta' }}
      />
      <Stack.Screen
        name="RegisterClient"
        component={RegisterClientScreen}
        options={{ title: 'Cliente' }}
      />
      <Stack.Screen
        name="RegisterDriver"
        component={RegisterDriverScreen}
        options={{ title: 'Motorista' }}
      />
    </Stack.Navigator>
  );
}
