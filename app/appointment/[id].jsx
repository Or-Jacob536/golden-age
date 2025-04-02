// app/appointment/[id].js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { Card, Button, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import { fetchMedicalAppointment } from '../../store/slices/medicalSlice';
import { router } from 'expo-router';
import ErrorScreen from '../../components/common/ErrorScreen';
import EmergencyButton from '../../components/common/EmergencyButton';

export default function AppointmentDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const dispatch = useDispatch();
  
  const appointmentDetails = useSelector(state => state.medical.appointmentDetails);
  const loading = useSelector(state => state.medical.loading);
  const error = useSelector(state => state.medical.error);
  
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchMedicalAppointment(id));
    }
  }, [id, isLoggedIn]);
  
  const handleCallDoctor = () => {
    if (appointmentDetails && appointmentDetails.doctor && appointmentDetails.doctor.phoneNumber) {
      Linking.openURL(`tel:${appointmentDetails.doctor.phoneNumber}`);
    }
  };
  
  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.notLoggedInContainer}>
          <Text style={[styles.notLoggedInText, { color: theme.colors.text }]}>
            {t('medical.loginRequired')}
          </Text>
          <Button 
            mode="contained" 
            onPress={() => router.push('/(auth)/login')}
            style={{ backgroundColor: theme.colors.primary }}
          >
            {t('auth.loginButton')}
          </Button>
        </View>
      </View>
    );
  }
  
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
        onRetry={() => dispatch(fetchMedicalAppointment(id))}
        onBack={() => router.back()}
      />
    );
  }
  
  if (!appointmentDetails) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {t('appointmentDetails.notFound')}
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
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t('appointmentDetails.title')}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <View style={styles.doctorSection}>
              {appointmentDetails.doctor.imageUrl ? (
                <Image 
                  source={{ uri: appointmentDetails.doctor.imageUrl }} 
                  style={styles.doctorImage} 
                />
              ) : (
                <View style={[styles.doctorImagePlaceholder, { backgroundColor: theme.colors.primary }]}>
                  <FontAwesome5 name="user-md" size={40} color="#fff" />
                </View>
              )}
              
              <View style={styles.doctorInfo}>
                <Text style={[styles.doctorName, { color: theme.colors.text }]}>
                  {appointmentDetails.doctor.name}
                </Text>
                <Text style={[styles.doctorSpecialty, { color: theme.colors.text }]}>
                  {appointmentDetails.doctor.specialty}
                </Text>
                
                {appointmentDetails.doctor.phoneNumber && (
                  <Button 
                    mode="outlined" 
                    icon="phone" 
                    onPress={handleCallDoctor}
                    style={[styles.callButton, { borderColor: theme.colors.primary }]}
                    labelStyle={{ color: theme.colors.primary }}
                  >
                    {t('appointmentDetails.callDoctor')}
                  </Button>
                )}
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <FontAwesome5 
                  name="calendar-alt" 
                  size={20} 
                  color={theme.colors.primary} 
                  style={styles.detailIcon}
                />
                <Text style={[styles.detailText, { color: theme.colors.text }]}>
                  {appointmentDetails.date}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <FontAwesome5 
                  name="clock" 
                  size={20} 
                  color={theme.colors.primary} 
                  style={styles.detailIcon}
                />
                <Text style={[styles.detailText, { color: theme.colors.text }]}>
                  {appointmentDetails.time}
                  {appointmentDetails.duration && ` (${appointmentDetails.duration} ${t('appointmentDetails.minutes')})`}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <FontAwesome5 
                  name="map-marker-alt" 
                  size={20} 
                  color={theme.colors.primary} 
                  style={styles.detailIcon}
                />
                <Text style={[styles.detailText, { color: theme.colors.text }]}>
                  {appointmentDetails.location}
                </Text>
              </View>
            </View>
            
            {appointmentDetails.notes && (
              <>
                <Divider style={styles.divider} />
                
                <View style={styles.notesSection}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {t('appointmentDetails.notes')}
                  </Text>
                  <Text style={[styles.notesText, { color: theme.colors.text }]}>
                    {appointmentDetails.notes}
                  </Text>
                </View>
              </>
            )}
            
            {appointmentDetails.preparationInstructions && (
              <>
                <Divider style={styles.divider} />
                
                <View style={styles.preparationSection}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {t('appointmentDetails.preparation')}
                  </Text>
                  <Text style={[styles.preparationText, { color: theme.colors.text }]}>
                    {appointmentDetails.preparationInstructions}
                  </Text>
                </View>
              </>
            )}
            
            {appointmentDetails.documents && appointmentDetails.documents.length > 0 && (
              <>
                <Divider style={styles.divider} />
                
                <View style={styles.documentsSection}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {t('appointmentDetails.documents')}
                  </Text>
                  
                  {appointmentDetails.documents.map((document, index) => (
                    <Button 
                      key={index}
                      mode="outlined" 
                      icon="file-document" 
                      onPress={() => console.log('View document:', document)}
                      style={[styles.documentButton, { borderColor: theme.colors.primary }]}
                      labelStyle={{ color: theme.colors.primary }}
                    >
                      {document.name || `${t('appointmentDetails.document')} ${index + 1}`}
                    </Button>
                  ))}
                </View>
              </>
            )}
          </Card.Content>
        </Card>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for emergency button
  },
  card: {
    borderRadius: 10,
  },
  doctorSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  doctorImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    marginBottom: 12,
  },
  callButton: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesSection: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  preparationSection: {
    marginBottom: 16,
  },
  preparationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  documentsSection: {
    marginBottom: 16,
  },
  documentButton: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});
