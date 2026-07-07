import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/DashboardScreen';
import WalletScreen from '../screens/WalletScreen';
import QrHubScreen from '../screens/qr/QrHubScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import colors, { font } from '../theme/colors';

const Tab = createBottomTabNavigator();

const ICONS = {
  Dashboard: 'home',
  Wallet: 'wallet',
  QR: 'qr-code',
  Transactions: 'time',
  Profile: 'person',
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  // Espaço reservado para a barra de navegação do Android (botões/gestos)
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ocean,
        tabBarInactiveTintColor: colors.mutedDark,
        tabBarStyle: {
          backgroundColor: colors.navyLight,
          borderTopColor: colors.border,
          height: 60 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: font.size.xs, fontWeight: font.weight.medium },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: 'Carteira' }} />
      <Tab.Screen name="QR" component={QrHubScreen} options={{ title: 'QR' }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'Histórico' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
