import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import i18n from '../../lib/i18n';
import { router } from 'expo-router';

const DashboardHeader = () => {
  const { t } = useTranslation();
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const { userData } = useContext(AuthContext);
  
  const currentDate = new Date();
  const locale = i18n.language === 'he' ? he : enUS;
  
  const formattedDate = format(currentDate, 'EEEE, d MMMM', { locale });
  
  const greeting = () => {
    const hours = currentDate.getHours();
    if (hours < 12) {
      return t('greetings.morning');
    } else if (hours < 18) {
      return t('greetings.afternoon');
    } else {
      return t('greetings.evening');
    }
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: theme.colors.primary }
    ]}>
      <View style={styles.headerContent}>
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            {greeting()}, {userData?.firstName || t('common.guest')}
          </Text>
        </View>
        
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleTheme}
          >
            <FontAwesome5 
              name={darkMode ? 'sun' : 'moon'} 
              size={22} 
              color={darkMode ? "#FFF" : "#000"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/settings')}
          >
            <FontAwesome5 name="tools" size={22} color="#e6e619" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'column',
    padding: 12,
  },
  dateSection: {
    marginBottom: 4,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  greetingSection: {
    marginBottom: 8,
  },
  greetingText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'absolute',
    top: Platform.OS === 'android' ? 8 : 0,
    right: 16,
  },
  iconButton: {
    marginLeft: 16,
    padding: 8,
  },
});

export default DashboardHeader;