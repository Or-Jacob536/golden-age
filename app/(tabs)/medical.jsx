// app/(tabs)/medical.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { TabView, TabBar } from 'react-native-tab-view';
import { Card, Divider, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import { fetchMedicalAppointments, fetchMedicalRecords } from '../../store/slices/medicalSlice';
import { router } from 'expo-router';
import ErrorScreen from '../../components/common/ErrorScreen';
import EmergencyButton from '../../components/common/EmergencyButton';
import AppointmentItem from '../../components/medical/AppointmentItem';
import MedicationItem from '../../components/medical/MedicationItem';

export default function MedicalScreen() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const dispatch = useDispatch();
  
  const [refreshing, setRefreshing] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    { key: 'appointments', title: t('medical.appointments') },
    { key: 'records', title: t('medical.records') },
  ]);
  
  const appointments = useSelector(state => state.medical.appointments);
  const medicalRecords = useSelector(state => state.medical.medicalRecords);
  const loading = useSelector(state => state.medical.loading);
  const error = useSelector(state => state.medical.error);
  
  const fetchMedicalData = async () => {
    if (!isLoggedIn) return;
    
    try {
      await Promise.all([
        dispatch(fetchMedicalAppointments()).unwrap(),
        dispatch(fetchMedicalRecords()).unwrap(),
      ]);
    } catch (error) {
      console.error('Error fetching medical data:', error);
    }
  };
  
  useEffect(() => {
    fetchMedicalData();
  }, [isLoggedIn]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMedicalData();
    setRefreshing(false);
  };
  
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colors.primary }}
      style={{ backgroundColor: theme.colors.background }}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.text}
      labelStyle={{ fontSize: 16, fontWeight: 'bold', textTransform: 'none' }}
    />
  );
  
  const renderAppointmentsTab = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    
    return (
      <ScrollView
        contentContainerStyle={styles.tabContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
          <Card.Title 
            title={t('medical.upcoming')} 
            titleStyle={[styles.sectionTitle, { color: theme.colors.text }]}
          />
          <Card.Content>
            {appointments.upcoming && appointments.upcoming.length > 0 ? (
              appointments.upcoming.map((appointment) => (
                <AppointmentItem
                  key={appointment.id}
                  appointment={appointment}
                  theme={theme}
                  onPress={() => router.push(`/appointment/${appointment.id}`)}
                />
              ))
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                {t('medical.noAppointments')}
              </Text>
            )}
          </Card.Content>
        </Card>
        
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
          <Card.Title 
            title={t('medical.past')} 
            titleStyle={[styles.sectionTitle, { color: theme.colors.text }]}
          />
          <Card.Content>
            {appointments.past && appointments.past.length > 0 ? (
              appointments.past.map((appointment) => (
                <AppointmentItem
                  key={appointment.id}
                  appointment={appointment}
                  theme={theme}
                  isPast={true}
                  onPress={() => router.push(`/appointment/${appointment.id}`)}
                />
              ))
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                {t('medical.noPastAppointments')}
              </Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };
  
  const renderRecordsTab = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }
    
    if (!medicalRecords) {
      return (
        <ScrollView
          contentContainerStyle={styles.tabContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            {t('medical.noRecords')}
          </Text>
        </ScrollView>
      );
    }
    
    return (
      <ScrollView
        contentContainerStyle={styles.tabContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Allergies Section */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
          <Card.Title 
            title={t('medical.allergies')} 
            titleStyle={[styles.sectionTitle, { color: theme.colors.text }]}
            left={(props) => (
              <FontAwesome5 name="allergies" size={24} color={theme.colors.error} />
            )}
          />
          <Card.Content>
            {medicalRecords.allergies && medicalRecords.allergies.length > 0 ? (
              <View style={styles.listContainer}>
                {medicalRecords.allergies.map((allergy, index) => (
                  <View key={index} style={styles.listItem}>
                    <FontAwesome5 
                      name="exclamation-circle" 
                      size={16} 
                      color={theme.colors.error} 
                      style={styles.listItemIcon}
                    />
                    <Text style={[styles.listItemText, { color: theme.colors.text }]}>
                      {allergy}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                {t('medical.noAllergies')}
              </Text>
            )}
          </Card.Content>
        </Card>
        
        {/* Chronic Conditions Section */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
          <Card.Title 
            title={t('medical.chronicConditions')} 
            titleStyle={[styles.sectionTitle, { color: theme.colors.text }]}
            left={(props) => (
              <FontAwesome5 name="file-medical" size={24} color={theme.colors.primary} />
            )}
          />
          <Card.Content>
            {medicalRecords.chronicConditions && medicalRecords.chronicConditions.length > 0 ? (
              <View style={styles.listContainer}>
                {medicalRecords.chronicConditions.map((condition, index) => (
                  <View key={index} style={styles.listItem}>
                    <FontAwesome5 
                      name="clipboard-list" 
                      size={16} 
                      color={theme.colors.primary} 
                      style={styles.listItemIcon}
                    />
                    <Text style={[styles.listItemText, { color: theme.colors.text }]}>
                      {condition}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                {t('medical.noChronicConditions')}
              </Text>
            )}
          </Card.Content>
        </Card>
        
        {/* Medications Section */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
          <Card.Title 
            title={t('medical.medications')} 
            titleStyle={[styles.sectionTitle, { color: theme.colors.text }]}
            left={(props) => (
              <FontAwesome5 name="pills" size={24} color={theme.colors.primary} />
            )}
          />
          <Card.Content>
            {medicalRecords.medications && medicalRecords.medications.length > 0 ? (
              <View style={styles.medicationsContainer}>
                {medicalRecords.medications.map((medication, index) => (
                  <MedicationItem
                    key={index}
                    medication={medication}
                    theme={theme}
                  />
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                {t('medical.noMedications')}
              </Text>
            )}
          </Card.Content>
        </Card>
        
        {/* Recent Tests Section */}
        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
          <Card.Title 
            title={t('medical.recentTests')} 
            titleStyle={[styles.sectionTitle, { color: theme.colors.text }]}
            left={(props) => (
              <FontAwesome5 name="vial" size={24} color={theme.colors.primary} />
            )}
          />
          <Card.Content>
            {medicalRecords.recentTests && medicalRecords.recentTests.length > 0 ? (
              <View style={styles.testsContainer}>
                {medicalRecords.recentTests.map((test, index) => (
                  <View key={test.id} style={styles.testItem}>
                    <View style={styles.testHeader}>
                      <Text style={[styles.testType, { color: theme.colors.text }]}>
                        {test.type}
                      </Text>
                      <Text style={[styles.testDate, { color: theme.colors.text }]}>
                        {test.date}
                      </Text>
                    </View>
                    
                    <Text style={[styles.testSummary, { color: theme.colors.text }]}>
                      {test.summary}
                    </Text>
                    
                    {test.downloadUrl && (
                      <Button 
                        mode="outlined" 
                        icon="download" 
                        style={[styles.downloadButton, { borderColor: theme.colors.primary }]}
                        labelStyle={{ color: theme.colors.primary }}
                        onPress={() => console.log('Download test results')}
                      >
                        {t('medical.downloadResults')}
                      </Button>
                    )}
                    
                    {index < medicalRecords.recentTests.length - 1 && (
                      <Divider style={styles.divider} />
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                {t('medical.noTests')}
              </Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };
  
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'appointments':
        return renderAppointmentsTab();
      case 'records':
        return renderRecordsTab();
      default:
        return null;
    }
  };
  
  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.notLoggedInContainer}>
          <FontAwesome5 
            name="lock" 
            size={50} 
            color={theme.colors.text} 
            style={styles.emptyIcon}
          />
          <Text style={[styles.notLoggedInText, { color: theme.colors.text }]}>
            {t('medical.loginRequired')}
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>{t('auth.loginButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  if (error && !refreshing) {
    return (
      <ErrorScreen
        error={error}
        onRetry={fetchMedicalData}
      />
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t('medical.title')}</Text>
      </View>
      
      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        renderTabBar={renderTabBar}
      />
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
  tabContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for emergency button
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  listContainer: {
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItemIcon: {
    marginRight: 8,
  },
  listItemText: {
    fontSize: 16,
  },
  medicationsContainer: {
    marginBottom: 8,
  },
  testsContainer: {
    marginBottom: 8,
  },
  testItem: {
    marginBottom: 16,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  testType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  testDate: {
    fontSize: 14,
  },
  testSummary: {
    fontSize: 14,
    marginBottom: 8,
  },
  downloadButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
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
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
});
