import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import RootNavigator from './src/navigation/RootNavigator';
import { wakeServer } from './src/services/api';

export default function App() {
  useEffect(() => {
    // Acorda o servidor gratuito assim que a app abre.
    wakeServer();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationsProvider>
          <RootNavigator />
        </NotificationsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
