import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterChooseScreen from '../screens/auth/RegisterChooseScreen';
import RegisterClientScreen from '../screens/auth/RegisterClientScreen';
import RegisterDriverScreen from '../screens/auth/RegisterDriverScreen';
import RegisterBusinessScreen from '../screens/auth/RegisterBusinessScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.navy },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterChoose" component={RegisterChooseScreen} options={{ title: 'Criar conta' }} />
      <Stack.Screen name="RegisterClient" component={RegisterClientScreen} options={{ title: 'Conta de Cliente' }} />
      <Stack.Screen name="RegisterDriver" component={RegisterDriverScreen} options={{ title: 'Conta de Motorista' }} />
      <Stack.Screen name="RegisterBusiness" component={RegisterBusinessScreen} options={{ title: 'Conta de Negócio' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar acesso' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Nova palavra-passe' }} />
    </Stack.Navigator>
  );
}
