import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { router, Link } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import * as Animatable from 'react-native-animatable';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { register } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determine text color based on theme to ensure readability
  const textColor = theme.dark ? "#FFFFFF" : theme.colors.text;
  const inputBackgroundColor = theme.dark ? "#333333" : "#FFFFFF";
  const inputTextColor = theme.dark ? "#FFFFFF" : "#000000";

  const handleRegister = async () => {
    // Basic validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phoneNumber.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(t('auth.fillAllFields'));
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    // Phone validation - simple check for now
    if (phoneNumber.length < 9) {
      setError(t('auth.invalidPhone'));
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    // Password match validation
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      const userData = {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      };

      console.log('Attempting to register with data:', userData);
      const result = await register(userData);
      console.log('Registration result:', result);
      
      if (result.success) {
        // On successful registration, redirect to login
        router.replace('/(auth)/login');
      } else {
        setError(result.message || t('auth.registrationFailed'));
      }
    } catch (error) {
      console.error('Registration error details:', error);
      setError(t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const toggleSecureConfirmEntry = () => {
    setSecureConfirmTextEntry(!secureConfirmTextEntry);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animatable.View 
          animation="fadeIn" 
          duration={1000} 
          style={styles.logoContainer}
        >
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: theme.colors.primary }]}>
            Golden Age
          </Text>
        </Animatable.View>

        <Animatable.View 
          animation="fadeInUp" 
          duration={800} 
          delay={300}
          style={styles.formContainer}
        >
          <Text style={[styles.welcomeText, { color: textColor }]}>
            {t('auth.createAccount')}
          </Text>
          
          {error ? (
            <Animatable.View animation="shake" duration={500}>
              <Text style={styles.errorText}>{error}</Text>
            </Animatable.View>
          ) : null}

          <View style={styles.nameRow}>
            <TextInput
              label={t('auth.firstName')}
              value={firstName}
              onChangeText={setFirstName}
              style={[styles.halfInput, { backgroundColor: inputBackgroundColor }]}
              mode="outlined"
              outlineColor={theme.dark ? "#777777" : "#DDDDDD"}
              activeOutlineColor={theme.colors.primary}
              textColor={inputTextColor}
              theme={{ 
                colors: { 
                  primary: theme.colors.primary,
                  text: inputTextColor,
                  placeholder: theme.dark ? "#AAAAAA" : "#999999",
                  background: inputBackgroundColor
                }
              }}
            />
            
            <TextInput
              label={t('auth.lastName')}
              value={lastName}
              onChangeText={setLastName}
              style={[styles.halfInput, { backgroundColor: inputBackgroundColor }]}
              mode="outlined"
              outlineColor={theme.dark ? "#777777" : "#DDDDDD"}
              activeOutlineColor={theme.colors.primary}
              textColor={inputTextColor}
              theme={{ 
                colors: { 
                  primary: theme.colors.primary,
                  text: inputTextColor,
                  placeholder: theme.dark ? "#AAAAAA" : "#999999",
                  background: inputBackgroundColor
                }
              }}
            />
          </View>

          <TextInput
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            style={[styles.input, { backgroundColor: inputBackgroundColor }]}
            mode="outlined"
            left={<TextInput.Icon icon="email" color={theme.colors.primary} />}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            outlineColor={theme.dark ? "#777777" : "#DDDDDD"}
            activeOutlineColor={theme.colors.primary}
            textColor={inputTextColor}
            theme={{ 
              colors: { 
                primary: theme.colors.primary,
                text: inputTextColor,
                placeholder: theme.dark ? "#AAAAAA" : "#999999",
                background: inputBackgroundColor
              }
            }}
          />

          <TextInput
            label={t('auth.phoneNumber')}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={[styles.input, { backgroundColor: inputBackgroundColor }]}
            mode="outlined"
            left={<TextInput.Icon icon="phone" color={theme.colors.primary} />}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            outlineColor={theme.dark ? "#777777" : "#DDDDDD"}
            activeOutlineColor={theme.colors.primary}
            textColor={inputTextColor}
            theme={{ 
              colors: { 
                primary: theme.colors.primary,
                text: inputTextColor,
                placeholder: theme.dark ? "#AAAAAA" : "#999999",
                background: inputBackgroundColor
              }
            }}
          />

          <TextInput
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            style={[styles.input, { backgroundColor: inputBackgroundColor }]}
            mode="outlined"
            left={<TextInput.Icon icon="lock" color={theme.colors.primary} />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? "eye" : "eye-off"}
                onPress={toggleSecureEntry}
                color={theme.colors.primary}
              />
            }
            textContentType="newPassword"
            outlineColor={theme.dark ? "#777777" : "#DDDDDD"}
            activeOutlineColor={theme.colors.primary}
            textColor={inputTextColor}
            theme={{ 
              colors: { 
                primary: theme.colors.primary,
                text: inputTextColor,
                placeholder: theme.dark ? "#AAAAAA" : "#999999",
                background: inputBackgroundColor
              }
            }}
          />

          <TextInput
            label={t('auth.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={secureConfirmTextEntry}
            style={[styles.input, { backgroundColor: inputBackgroundColor }]}
            mode="outlined"
            left={<TextInput.Icon icon="lock-check" color={theme.colors.primary} />}
            right={
              <TextInput.Icon
                icon={secureConfirmTextEntry ? "eye" : "eye-off"}
                onPress={toggleSecureConfirmEntry}
                color={theme.colors.primary}
              />
            }
            textContentType="newPassword"
            outlineColor={theme.dark ? "#777777" : "#DDDDDD"}
            activeOutlineColor={theme.colors.primary}
            textColor={inputTextColor}
            theme={{ 
              colors: { 
                primary: theme.colors.primary,
                text: inputTextColor,
                placeholder: theme.dark ? "#AAAAAA" : "#999999",
                background: inputBackgroundColor
              }
            }}
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            style={[styles.registerButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={styles.registerButtonText}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              t('auth.registerButton')
            )}
          </Button>

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: textColor }]}>
              {t('auth.hasAccount')}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
                  {t('auth.login')}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
    height: 56,
  },
  input: {
    marginBottom: 16,
    height: 56,
  },
  registerButton: {
    paddingVertical: 8,
    marginBottom: 24,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 16,
    marginRight: 5,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});