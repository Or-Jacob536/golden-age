// app/(auth)/_layout.js
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AuthLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 22,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ 
          title: t('auth.login'),
          headerShown: true
        }}
      />
      <Stack.Screen
        name="login"
        options={{ 
          title: t('auth.login'),
          headerShown: true
        }}
      />
      <Stack.Screen
        name="register"
        options={{ 
          title: t('auth.register'),
          headerShown: true
        }}
      />
      <Stack.Screen
        name="forgotPassword"
        options={{ 
          title: t('auth.forgotPassword'),
          headerShown: true
        }}
      />
      <Stack.Screen
        name="resetPassword"
        options={{ 
          title: t('auth.resetPassword'),
          headerShown: true
        }}
      />
    </Stack>
  );
}