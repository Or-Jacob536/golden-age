// components/common/ErrorScreen.jsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '../../contexts/ThemeContext';

const ErrorScreen = ({ error, onRetry, onBack }) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FontAwesome5 
        name="exclamation-circle" 
        size={60} 
        color={theme.colors.error} 
        style={styles.icon} 
      />
      
      <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
        {t('common.errorOccurred')}
      </Text>
      
      <Text style={[styles.errorMessage, { color: theme.colors.text }]}>
        {error || t('common.genericError')}
      </Text>
      
      <View style={styles.buttonContainer}>
        {onRetry && (
          <Button 
            mode="contained" 
            onPress={onRetry}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
          >
            {t('common.retry')}
          </Button>
        )}
        
        {onBack && (
          <Button 
            mode="outlined" 
            onPress={onBack}
            style={[styles.button, { borderColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.primary }}
          >
            {t('common.back')}
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    marginHorizontal: 8,
    minWidth: 120,
  },
});

export default ErrorScreen;
