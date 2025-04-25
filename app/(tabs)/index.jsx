import React, { useState, useEffect, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { Card, Button, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { fetchDailyMenu } from '../../store/slices/restaurantSlice';
import { fetchActivities } from '../../store/slices/activitiesSlice';
import { fetchMedicalAppointments } from '../../store/slices/medicalSlice';
import { fetchMessages } from '../../store/slices/messagesSlice';
import { router } from 'expo-router';
import DashboardHeader from '../../components/home/DashboardHeader';
import EmergencyButton from '../../components/common/EmergencyButton';
import { selectDailyMenu } from '../../store/slices/restaurantSlice';
import { selectDailyActivities, selectMyActivities } from '../../store/slices/activitiesSlice';
import { selectUpcomingAppointments } from '../../store/slices/medicalSlice';
import { selectMessages, selectUnreadCount } from '../../store/slices/messagesSlice';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dailyMenu = useSelector(selectDailyMenu);
  const dailyActivitiesData = useSelector(selectDailyActivities);
  const activities = dailyActivitiesData?.activities || [];
  const upcomingAppointments = useSelector(selectUpcomingAppointments) || [];
  const messages = useSelector(selectMessages) || [];
  const unreadCount = useSelector(selectUnreadCount) || 0;
  
  const fetchHomeData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        dispatch(fetchDailyMenu()).unwrap(),
        dispatch(fetchActivities()).unwrap(),
        dispatch(fetchMedicalAppointments()).unwrap(),
        dispatch(fetchMessages()).unwrap()
      ]);
    } catch (error) {
      console.error('Error fetching home data:', error);
      setError(t('home.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  const currentMeal = useMemo(() => {
    if (!dailyMenu || !dailyMenu.meals) return null;
    
    const now = new Date();
    const hours = now.getHours();
    
    if (hours >= 6 && hours < 10) {
      return {
        type: 'breakfast',
        title: t('restaurant.breakfast'),
        data: dailyMenu.meals.breakfast
      };
    } else if (hours >= 11 && hours < 15) {
      return {
        type: 'lunch',
        title: t('restaurant.lunch'),
        data: dailyMenu.meals.lunch
      };
    } else if (hours >= 17 && hours < 21) {
      return {
        type: 'dinner',
        title: t('restaurant.dinner'),
        data: dailyMenu.meals.dinner
      };
    }
    
    // Default to showing next meal
    if (hours < 6 || hours >= 21) {
      return {
        type: 'breakfast',
        title: t('restaurant.breakfast'),
        data: dailyMenu.meals.breakfast
      };
    } else if (hours >= 10 && hours < 11) {
      return {
        type: 'lunch',
        title: t('restaurant.lunch'),
        data: dailyMenu.meals.lunch
      };
    } else {
      return {
        type: 'dinner',
        title: t('restaurant.dinner'),
        data: dailyMenu.meals.dinner
      };
    }
  }, [dailyMenu, t]);  

  const upcomingActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    return activities.filter(activity => {
      const [activityHour, activityMinute] = activity.startTime.split(':').map(Number);
      return (
        activityHour > currentHour || 
        (activityHour === currentHour && activityMinute > currentMinutes)
      );
    }).slice(0, 3); // Get next 3 upcoming activities
  }, [activities]);

  const renderMealCard = () => {
    if (!currentMeal) return null;
    
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Card.Title 
          title={currentMeal.title} 
          titleStyle={[styles.cardTitle, { color: theme.colors.text }]}
          left={(props) => (
            <FontAwesome5 name="utensils" size={24} color={theme.colors.primary} />
          )}
        />
        <Card.Content>
          {currentMeal.data?.mainDishes && (
            <View style={styles.menuSection}>
              <Text style={[styles.menuSectionTitle, { color: theme.colors.text }]}>
                {t('restaurant.mainDishes')}
              </Text>
              {currentMeal.data.mainDishes.map((dish, index) => (
                <Text key={index} style={[styles.menuItem, { color: theme.colors.text }]}>
                  • {dish}
                </Text>
              ))}
            </View>
          )}
          
          {currentMeal.data?.sides && (
            <View style={styles.menuSection}>
              <Text style={[styles.menuSectionTitle, { color: theme.colors.text }]}>
                {t('restaurant.sides')}
              </Text>
              {currentMeal.data.sides.map((side, index) => (
                <Text key={index} style={[styles.menuItem, { color: theme.colors.text }]}>
                  • {side}
                </Text>
              ))}
            </View>
          )}
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="text"
            onPress={() => router.push('/(tabs)/restaurant')}
            buttonColor={theme.colors.primary}
            labelStyle={styles.buttonLabel}
          >
            {t('home.viewAll')}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderActivitiesCard = () => {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Card.Title 
          title={t('home.upcomingActivities')} 
          titleStyle={[styles.cardTitle, { color: theme.colors.text }]}
          left={(props) => (
            <FontAwesome5 name="calendar-alt" size={24} color={theme.colors.primary} />
          )}
        />
        <Card.Content>
          {upcomingActivities.length > 0 ? (
            upcomingActivities.map((activity, index) => (
              <TouchableOpacity 
                key={activity.id} 
                style={styles.activityItem}
                onPress={() => router.push(`/activity/${activity.id}`)}
              >
                <View style={styles.activityTime}>
                  <Text style={[styles.activityTimeText, { color: theme.colors.primary }]}>
                    {activity.startTime}
                  </Text>
                </View>
                <View style={styles.activityDetails}>
                  <Text style={[styles.activityTitle, { color: theme.colors.text }]}>
                    {activity.title}
                  </Text>
                  <Text style={[styles.activityLocation, { color: theme.colors.text }]}>
                    {activity.location}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.noItemsText, { color: theme.colors.text }]}>
              {t('activities.noActivities')}
            </Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="text"
            onPress={() => router.push('/(tabs)/activities')}
            buttonColor={theme.colors.primary}
            labelStyle={styles.buttonLabel}
          >
            {t('home.viewAll')}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderAppointmentCard = () => {
    const upcomingAppointment = upcomingAppointments[0];
    
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Card.Title 
          title={t('home.upcomingAppointment')} 
          titleStyle={[styles.cardTitle, { color: theme.colors.text }]}
          left={(props) => (
            <FontAwesome5 name="heartbeat" size={24} color={theme.colors.primary} />
          )}
        />
        <Card.Content>
          {upcomingAppointment ? (
            <TouchableOpacity 
              style={styles.appointmentContainer}
              onPress={() => router.push(`/appointment/${upcomingAppointment.id}`)}
            >
              <View style={styles.appointmentHeader}>
                <Text style={[styles.appointmentDate, { color: theme.colors.text }]}>
                  {upcomingAppointment.date}, {upcomingAppointment.time}
                </Text>
              </View>
              <View style={styles.appointmentDetails}>
                <Text style={[styles.doctorName, { color: theme.colors.text }]}>
                  {upcomingAppointment.doctor}
                </Text>
                <Text style={[styles.appointmentType, { color: theme.colors.text }]}>
                  {upcomingAppointment.specialty}
                </Text>
                <Text style={[styles.appointmentLocation, { color: theme.colors.text }]}>
                  {upcomingAppointment.location}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.noItemsText, { color: theme.colors.text }]}>
              {t('medical.noAppointments')}
            </Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="text"
            onPress={() => router.push('/(tabs)/medical')}
            buttonColor={theme.colors.primary}
            labelStyle={styles.buttonLabel}
          >
            {t('home.viewAll')}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const renderMessagesCard = () => {
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Card.Title 
          title={t('home.messages')} 
          titleStyle={[styles.cardTitle, { color: theme.colors.text }]}
          left={(props) => (
            <FontAwesome5 name="envelope" size={24} color={theme.colors.primary} />
          )}
          right={(props) => (
            unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )
          )}
        />
        <Card.Content>
          <Text style={[styles.messagesDescription, { color: theme.colors.text }]}>
            {unreadCount > 0 
              ? t('home.unreadMessages', { count: unreadCount })
              : t('home.noMessages')
            }
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="text"
            onPress={() => router.push('/(tabs)/messages')}
            buttonColor={theme.colors.primary}
            labelStyle={styles.buttonLabel}
          >
            {t('home.viewAll')}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DashboardHeader user={user} />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              {renderMealCard()}
              {renderActivitiesCard()}
              {renderAppointmentCard()}
              {renderMessagesCard()}
            </>
          )}
        </ScrollView>
      )}
      
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
  scrollContent: {
    padding: 16,
    paddingBottom: 90, // Extra padding at bottom for emergency button
  },
  card: {
    marginBottom: 16,
    elevation: 3,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
  menuSection: {
    marginBottom: 12,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItem: {
    fontSize: 16,
    marginBottom: 2,
  },
  buttonLabel: {
    fontSize: 16,
    color: '#fff'
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  activityTime: {
    width: 60,
    marginRight: 12,
  },
  activityTimeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  activityLocation: {
    fontSize: 14,
  },
  appointmentContainer: {
    marginBottom: 8,
  },
  appointmentHeader: {
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 14,
    marginBottom: 2,
  },
  appointmentLocation: {
    fontSize: 14,
  },
  unreadBadge: {
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  noItemsText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginVertical: 12,
    textAlign: 'center',
  },
});