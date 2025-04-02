import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = params; // Reset token from URL if your app supports deep linking

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    // Basic validation
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert(t('common.error'), t('auth.allFieldsRequired'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return;
    }

    if (password.length < 8) {
      Alert.alert(t('common.error'), t('auth.passwordTooShort'));
      return;
    }

    try {
      setIsLoading(true);
      
      // Here you would add your actual password reset functionality
      // For example:
      // await resetPasswordApi(token, password);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        t('auth.success'),
        t('auth.passwordResetSuccess'),
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.passwordResetFailed'));
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.resetPassword')}</Text>
      <Text style={styles.subtitle}>{t('auth.createNewPassword')}</Text>
      
      <TextInput
        style={styles.input}
        placeholder={t('auth.newPassword')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder={t('auth.confirmPassword')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? t('common.processing') : t('auth.resetPassword')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.push('/login')}
      >
        <Text style={styles.backButtonText}>{t('auth.backToLogin')}</Text>
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