// components/common/LoadingScreen.jsx
import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../contexts/ThemeContext';

const LoadingScreen = ({ message }) => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && (
        <Text style={[styles.message, { color: theme.colors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

export default LoadingScreen;