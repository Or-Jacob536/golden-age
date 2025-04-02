import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { updateUserSettings } from '../store/slices/userSlice';
import { router } from 'expo-router';
import i18n from '../lib/i18n';
import * as Animatable from "react-native-animatable";
import EmergencyButton from '../components/common/EmergencyButton';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme, darkMode, toggleTheme } = useContext(ThemeContext);
  const { isLoggedIn, userData, logout } = useContext(AuthContext);
  const dispatch = useDispatch();
  const [language, setLanguage] = useState(i18n.language);
  const [fontSizeScale, setFontSizeScale] = useState(1.0); // 1.0 is default
  const [highContrast, setHighContrast] = useState(false);
  const [voiceGuidance, setVoiceGuidance] = useState(false);
  const [loading, setLoading] = useState(false);
  const userSettings = useSelector(state => state.user.settings);
  
  // Initialize settings from Redux store
  useEffect(() => {
    if (userSettings) {
      setLanguage(userSettings.languagePreference || 'he');      
      if (userSettings.fontSizeScale) {
        setFontSizeScale(userSettings.fontSizeScale);
      }
      if (userSettings.highContrast !== undefined) {
        setHighContrast(userSettings.highContrast);
      }
      if (userSettings.voiceGuidance !== undefined) {
        setVoiceGuidance(userSettings.voiceGuidance);
      }
    }
  }, [userSettings]);
  
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    
    if (isLoggedIn) {
      dispatch(updateUserSettings({ languagePreference: lang }));
    }
  };
  
  const handleFontSizeChange = (scale) => {
    setFontSizeScale(scale);
    
    if (isLoggedIn) {
      dispatch(updateUserSettings({ fontSizeScale: scale }));
    }
  };
  
  const handleHighContrastToggle = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    
    if (isLoggedIn) {
      dispatch(updateUserSettings({ highContrast: newValue }));
    }
  };
  
  const handleVoiceGuidanceToggle = () => {
    const newValue = !voiceGuidance;
    setVoiceGuidance(newValue);
    
    if (isLoggedIn) {
      dispatch(updateUserSettings({ voiceGuidance: newValue }));
    }
  };
  
  const handleLogout = async () => {
    Alert.alert(
      t('settings.logoutConfirmTitle'),
      t('settings.logoutConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.logout'),
          onPress: async () => {
            setLoading(true);
            try {
              console.log("Starting logout process...");
              const result = await logout();
              console.log("Logout result:", result);
              
              if (result.success) {
                console.log("Logout successful, navigating to login screen");
                router.replace('/(auth)/login');
              } else {
                console.error("Logout failed with error:", result.message);
                Alert.alert(t('common.error'), result.message || t('settings.logoutFailed'));
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(t('common.error'), t('settings.logoutFailed'));
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  // Determine text color based on theme to ensure readability
  const textColor = theme.dark ? "#FFFFFF" : theme.colors.text;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Account Section */}
        {isLoggedIn && (
          <Animatable.View animation="fadeIn" duration={800}>
            <Text style={[styles.sectionHeaderText, { color: theme.colors.primary }]}>
              {t('settings.account')}
            </Text>
            
            <View style={[styles.userCard, { backgroundColor: theme.colors.card }]}>
              <FontAwesome5 
                name="user-circle" 
                size={60} 
                color={theme.colors.primary} 
                style={styles.userIcon}
              />
              
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: textColor }]}>
                  {userData?.firstName} {userData?.lastName}
                </Text>
                <Text style={[styles.userEmail, { color: textColor }]}>
                  {userData?.email}
                </Text>
                <Text style={[styles.userPhone, { color: textColor }]}>
                  {userData?.phoneNumber}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
              onPress={() => router.push('/edit-profile')}
            >
              <FontAwesome5 
                name="user-edit" 
                size={20} 
                color={theme.colors.primary} 
                style={styles.settingIcon}
              />
              <Text style={[styles.settingText, { color: textColor }]}>
                {t('settings.editProfile')}
              </Text>
              <FontAwesome5 
                name="chevron-right" 
                size={16} 
                color={textColor}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
              onPress={handleLogout}
              disabled={loading}
            >
              <FontAwesome5 
                name="sign-out-alt" 
                size={20} 
                color={theme.colors.error} 
                style={styles.settingIcon}
              />
              {loading ? (
                <ActivityIndicator color={theme.colors.error} size="small" style={{marginRight: 8}} />
              ) : null}
              <Text style={[styles.settingText, { color: theme.colors.error }]}>
                {t('settings.logout')}
              </Text>
              <FontAwesome5 
                name="chevron-right" 
                size={16} 
                color={textColor}
              />
            </TouchableOpacity>
            
            <View style={styles.divider} />
          </Animatable.View>
        )}
        
        {/* Appearance Section */}
        <Animatable.View animation="fadeIn" duration={800} delay={200}>
          <Text style={[styles.sectionHeaderText, { color: theme.colors.primary }]}>
            {t('settings.appearance')}
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <FontAwesome5 
              name={darkMode ? 'moon' : 'sun'} 
              size={20} 
              color={theme.colors.primary} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: textColor }]}>
              {t('settings.darkMode')}
            </Text>
            <Switch
              value={darkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <FontAwesome5 
              name="adjust" 
              size={20} 
              color={theme.colors.primary} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: textColor }]}>
              {t('settings.highContrast')}
            </Text>
            <Switch
              value={highContrast}
              onValueChange={handleHighContrastToggle}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <FontAwesome5 
              name="text-height" 
              size={20} 
              color={theme.colors.primary} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: textColor }]}>
              {t('settings.fontSize')}
            </Text>
            <View style={styles.fontSizeButtons}>
              <TouchableOpacity
                style={[
                  styles.fontSizeButton,
                  fontSizeScale === 0.8 && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => handleFontSizeChange(0.8)}
              >
                <Text style={[
                  styles.fontSizeButtonText,
                  fontSizeScale === 0.8 && { color: '#fff' }
                ]}>
                  A
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.fontSizeButton,
                  fontSizeScale === 1.0 && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => handleFontSizeChange(1.0)}
              >
                <Text style={[
                  styles.fontSizeButtonText,
                  { fontSize: 16 },
                  fontSizeScale === 1.0 && { color: '#fff' }
                ]}>
                  A
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.fontSizeButton,
                  fontSizeScale === 1.2 && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => handleFontSizeChange(1.2)}
              >
                <Text style={[
                  styles.fontSizeButtonText,
                  { fontSize: 20 },
                  fontSizeScale === 1.2 && { color: '#fff' }
                ]}>
                  A
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.divider} />
        </Animatable.View>
        
        {/* Language Section */}
        <Animatable.View animation="fadeIn" duration={800} delay={300}>
          <Text style={[styles.sectionHeaderText, { color: theme.colors.primary }]}>
            {t('settings.language')}
          </Text>
          
          <TouchableOpacity
            style={[
              styles.settingItem, 
              { backgroundColor: theme.colors.card },
              language === 'he' && styles.selectedItem
            ]}
            onPress={() => handleLanguageChange('he')}
          >
            <FontAwesome5 
              name="language" 
              size={20} 
              color={theme.colors.primary} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: textColor }]}>
              עברית
            </Text>
            {language === 'he' && (
              <FontAwesome5 
                name="check" 
                size={16} 
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.settingItem, 
              { backgroundColor: theme.colors.card },
              language === 'en' && styles.selectedItem
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <FontAwesome5 
              name="language" 
              size={20} 
              color={theme.colors.primary} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: textColor }]}>
              English
            </Text>
            {language === 'en' && (
              <FontAwesome5 
                name="check" 
                size={16} 
                color={theme.colors.primary}
              />
            )}
          </TouchableOpacity>
          
          <View style={styles.divider} />
        </Animatable.View>
        
        {/* Accessibility Section */}
        <Animatable.View animation="fadeIn" duration={800} delay={400}>
          <Text style={[styles.sectionHeaderText, { color: theme.colors.primary }]}>
            {t('settings.accessibility')}
          </Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <FontAwesome5 
              name="volume-up" 
              size={20} 
              color={theme.colors.primary} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: textColor }]}>
              {t('settings.voiceGuidance')}
            </Text>
            <Switch
              value={voiceGuidance}
              onValueChange={handleVoiceGuidanceToggle}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <View style={styles.divider} />
        </Animatable.View>
        
        {/* About Section */}
        <Animatable.View animation="fadeIn" duration={800} delay={500}>
          <Text style={[styles.sectionHeaderText, { color: theme.colors.primary }]}>
            {t('settings.about')}
          </Text>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
          >
            <FontAwesome5 
              name="info-circle" 
              size={20} 
              color={theme.colors.primary} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: textColor }]}>
              {t('settings.appVersion')}
            </Text>
            <Text style={[styles.versionText, { color: textColor }]}>
              1.0.0
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/terms-of-service')}
          >
            <FontAwesome5 
              name="file-alt" 
              size={20} 
              color={theme.colors.primary} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: textColor }]}>
              {t('settings.termsOfService')}
            </Text>
            <FontAwesome5 
              name="chevron-right" 
              size={16} 
              color={textColor}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/privacy-policy')}
          >
            <FontAwesome5 
              name="shield-alt" 
              size={20} 
              color={theme.colors.primary} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: textColor }]}>
              {t('settings.privacyPolicy')}
            </Text>
            <FontAwesome5 
              name="chevron-right" 
              size={16} 
              color={textColor}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={() => router.push('/contact')}
          >
            <FontAwesome5 
              name="headset" 
              size={20} 
              color={theme.colors.primary} 
              style={styles.settingIcon}
            />
            <Text style={[styles.settingText, { color: textColor }]}>
              {t('settings.contact')}
            </Text>
            <FontAwesome5 
              name="chevron-right" 
              size={16} 
              color={textColor}
            />
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
      <EmergencyButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for emergency button
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userIcon: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  settingIcon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
  fontSizeButtons: {
    flexDirection: 'row',
  },
  fontSizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  fontSizeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
});