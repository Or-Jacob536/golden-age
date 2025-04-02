import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async () => {
    // Basic validation
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert(t('common.error'), t('auth.invalidEmail'));
      return;
    }

    try {
      setIsLoading(true);
      
      // Here you would add your actual password reset request
      // For example:
      // await passwordResetApi(email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        t('auth.resetSent'),
        t('auth.resetInstructions'),
        [{ text: 'OK', onPress: () => router.push('/login') }]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.resetFailed'));
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.forgotPassword')}</Text>
      <Text style={styles.subtitle}>{t('auth.enterEmail')}</Text>
      
      <TextInput
        style={styles.input}
        placeholder={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleForgotPassword}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? t('common.sending') : t('auth.sendResetLink')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>{t('common.back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#4A90E2',
    fontSize: 16,
  },
});