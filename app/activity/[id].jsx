import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { Button, Divider, Badge, Portal, Dialog } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { fetchActivityDetails, registerForActivity, cancelActivityRegistration } from '../../store/slices/activitiesSlice';
import { format, parseISO } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import i18n from '../../lib/i18n';
import { router } from 'expo-router';
import ErrorScreen from '../../components/common/ErrorScreen';
import EmergencyButton from '../../components/common/EmergencyButton';

export default function ActivityDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const dispatch = useDispatch();
  
  const activityDetails = useSelector(state => state.activities.activityDetails);
  const loading = useSelector(state => state.activities.loading);
  const error = useSelector(state => state.activities.error);
  
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  
  const locale = i18n.language === 'he' ? he : enUS;
  
  useEffect(() => {
    dispatch(fetchActivityDetails(id));
  }, [id]);
  
  const handleRegister = async () => {
    if (!isLoggedIn) {
      router.push('/(auth)/login');
      return;
    }
    
    setConfirmDialogVisible(false);
    
    try {
      await dispatch(registerForActivity(id)).unwrap();
      
      Alert.alert(
        t('activityDetails.success'),
        t('activityDetails.registrationSuccess'),
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error registering for activity:', error);
      const errorMessage = error.message || t('activityDetails.registrationError');
      
      Alert.alert(
        t('activityDetails.error'),
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleCancelRegistration = async () => {
    setCancelDialogVisible(false);
    
    try {
      await dispatch(cancelActivityRegistration(id)).unwrap();
      
      Alert.alert(
        t('activityDetails.success'),
        t('activityDetails.cancellationSuccess'),
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error canceling registration:', error);
      const errorMessage = error.message || t('activityDetails.cancellationError');
      
      Alert.alert(
        t('activityDetails.error'),
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };
  
  const renderRegistrationStatus = () => {
    if (!activityDetails) return null;
    
    if (activityDetails.isRegistered) {
      return (
        <View style={styles.statusContainer}>
          <Badge style={[styles.badge, { backgroundColor: theme.colors.success }]}>
            {t('activities.registered')}
          </Badge>
        </View>
      );
    }
    
    const isFull = activityDetails.currentParticipants >= activityDetails.maxParticipants;
    
    if (isFull) {
      return (
        <View style={styles.statusContainer}>
          <Badge style={[styles.badge, { backgroundColor: theme.colors.error }]}>
            {t('activities.full')}
          </Badge>
        </View>
      );
    }
    
    return null;
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (error) {
    return (
      <ErrorScreen
        error={error}
        onRetry={() => dispatch(fetchActivityDetails(id))}
        onBack={() => router.back()}
      />
    );
  }
  
  if (!activityDetails) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {t('activityDetails.notFound')}
        </Text>
        <Button 
          mode="contained" 
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
        >
          {t('common.back')}
        </Button>
      </View>
    );
  }
  
  const activityDate = parseISO(activityDetails.date);
  const formattedDate = format(activityDate, 'EEEE, d MMMM yyyy', { locale });
  const participantsPercentage = activityDetails.maxParticipants 
    ? (activityDetails.currentParticipants / activityDetails.maxParticipants) * 100 
    : 0;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {activityDetails.imageUrl ? (
          <Image 
            source={{ uri: activityDetails.imageUrl }} 
            style={styles.activityImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary }]}>
            <FontAwesome5 name="calendar-alt" size={60} color="#fff" />
          </View>
        )}
        
        <View style={styles.contentContainer}>
          {renderRegistrationStatus()}
          
          <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
            {activityDetails.title}
          </Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <FontAwesome5 
                name="calendar" 
                size={18} 
                color={theme.colors.primary} 
                style={styles.metaIcon}
              />
              <Text style={[styles.metaText, { color: theme.colors.text }]}>
                {formattedDate}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <FontAwesome5 
                name="clock" 
                size={18} 
                color={theme.colors.primary} 
                style={styles.metaIcon}
              />
              <Text style={[styles.metaText, { color: theme.colors.text }]}>
                {activityDetails.startTime} - {activityDetails.endTime}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <FontAwesome5 
                name="map-marker-alt" 
                size={18} 
                color={theme.colors.primary} 
                style={styles.metaIcon}
              />
              <Text style={[styles.metaText, { color: theme.colors.text }]}>
                {activityDetails.location}
              </Text>
            </View>
            
            {activityDetails.instructor && (
              <View style={styles.metaItem}>
                <FontAwesome5 
                  name="user" 
                  size={18} 
                  color={theme.colors.primary} 
                  style={styles.metaIcon}
                />
                <Text style={[styles.metaText, { color: theme.colors.text }]}>
                  {activityDetails.instructor}
                </Text>
              </View>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('activities.description')}
          </Text>
          <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
            {activityDetails.description || t('activityDetails.noDescription')}
          </Text>
          
          {activityDetails.equipment && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('activities.equipment')}
              </Text>
              <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
                {activityDetails.equipment}
              </Text>
            </>
          )}
          
          <Divider style={styles.divider} />
          
          <View style={styles.participantsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('activities.participants')}
            </Text>
            
            <View style={styles.participantsInfo}>
              <Text style={[styles.participantsText, { color: theme.colors.text }]}>
                {activityDetails.currentParticipants} / {activityDetails.maxParticipants || t('activityDetails.unlimited')}
              </Text>
              
              {activityDetails.maxParticipants > 0 && (
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        backgroundColor: 
                          participantsPercentage > 80 ? theme.colors.error : 
                          participantsPercentage > 50 ? theme.colors.warning : 
                          theme.colors.success,
                        width: `${Math.min(participantsPercentage, 100)}%`
                      }
                    ]} 
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        {activityDetails.isRegistered ? (
          <Button 
            mode="outlined" 
            onPress={() => setCancelDialogVisible(true)}
            style={[styles.button, { borderColor: theme.colors.error }]}
            labelStyle={{ color: theme.colors.error }}
            loading={loading}
            disabled={loading}
          >
            {t('activityDetails.cancelRegistration')}
          </Button>
        ) : (
          <Button 
            mode="contained" 
            onPress={() => setConfirmDialogVisible(true)}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: '#fff' }}
            loading={loading}
            disabled={loading || activityDetails.currentParticipants >= activityDetails.maxParticipants}
          >
            {activityDetails.currentParticipants >= activityDetails.maxParticipants
              ? t('activities.full')
              : t('activities.register')}
          </Button>
        )}
      </View>
      
      {/* Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={confirmDialogVisible}
          onDismiss={() => setConfirmDialogVisible(false)}
          style={{ backgroundColor: theme.colors.card }}
        >
          <Dialog.Title style={{ color: theme.colors.text }}>
            {t('activityDetails.confirmRegistration')}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.text }}>
              {t('activityDetails.confirmRegistrationMessage')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialogVisible(false)}>
              {t('common.cancel')}
            </Button>
            <Button onPress={handleRegister}>
              {t('common.confirm')}
            </Button>
          </Dialog.Actions>
        </Dialog>
        
        <Dialog
          visible={cancelDialogVisible}
          onDismiss={() => setCancelDialogVisible(false)}
          style={{ backgroundColor: theme.colors.card }}
        >
          <Dialog.Title style={{ color: theme.colors.text }}>
            {t('activityDetails.confirmCancellation')}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.text }}>
              {t('activityDetails.confirmCancellationMessage')}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCancelDialogVisible(false)}>
              {t('common.no')}
            </Button>
            <Button onPress={handleCancelRegistration} color={theme.colors.error}>
              {t('common.yes')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <EmergencyButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    marginTop: 16,
  },
  activityImage: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metaContainer: {
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaIcon: {
    marginRight: 10,
    width: 24,
    textAlign: 'center',
  },
  metaText: {
    fontSize: 16,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  participantsContainer: {
    marginBottom: 16,
  },
  participantsInfo: {
    marginTop: 8,
  },
  participantsText: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    paddingVertical: 8,
  },
});
