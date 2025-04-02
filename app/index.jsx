import { Redirect } from 'expo-router';
import { useContext, useEffect } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

export default function Index() {
  const { isLoggedIn, isLoading } = useContext(AuthContext);

  // Add logging to help debug
  useEffect(() => {
    console.log('Index route - Auth state:', { isLoggedIn, isLoading });
  }, [isLoggedIn, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (isLoggedIn) {
    console.log('User is logged in, redirecting to tabs');
    return <Redirect href="/(tabs)" />;
  }

  console.log('User is not logged in, redirecting to login');
  return <Redirect href="/(auth)/login" />;
}