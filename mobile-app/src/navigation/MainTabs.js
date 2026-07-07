import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import WalletScreen from '../screens/WalletScreen';
import QrHubScreen from '../screens/QrHubScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  return (
    <Text style={{ fontSize: 11, color: focused ? colors.yellow : colors.muted, fontWeight: '600' }}>
      {label}
    </Text>
  );
}

export default function MainTabs() {
  const { isDriver } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.navyLight },
        headerTintColor: colors.white,
        tabBarStyle: {
          backgroundColor: colors.navyLight,
          borderTopColor: colors.border,
          height: 58,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.yellow,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: isDriver ? 'Painel Motorista' : 'Painel',
          tabBarLabel: ({ focused }) => <TabIcon label="Painel" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="QR"
        component={QrHubScreen}
        options={{
          title: 'QR Code',
          tabBarLabel: ({ focused }) => <TabIcon label="QR" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          title: 'Carteira',
          tabBarLabel: ({ focused }) => <TabIcon label="Carteira" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={TransactionsScreen}
        options={{
          title: 'Histórico',
          tabBarLabel: ({ focused }) => <TabIcon label="Histórico" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarLabel: ({ focused }) => <TabIcon label="Perfil" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
