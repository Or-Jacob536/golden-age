import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import store from '../store';
import i18n from '../lib/i18n';
import { theme } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik-Regular.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik-Medium.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <ThemeProvider>
              <AuthProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                />
              </AuthProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </PaperProvider>
      </I18nextProvider>
      <StatusBar style='auto' />
    </Provider>
  );
}
