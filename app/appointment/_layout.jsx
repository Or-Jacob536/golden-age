// app/appointment/_layout.js
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AppointmentLayout() {
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
        name="[id]"
        options={{ 
          title: t('medical.appointmentDetails'),
          headerShown: false
        }}
      />
    </Stack>
  );
}
