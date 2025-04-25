import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../contexts/ThemeContext';
import { fetchRestaurantHours, fetchDailyMenu } from '../../store/slices/restaurantSlice';
import ErrorScreen from '../../components/common/ErrorScreen';

export default function RestaurantScreen() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  
  const dailyMenu = useSelector(state => state.restaurant.dailyMenu);
  const restaurantHours = useSelector(state => state.restaurant.hours);
  const loading = useSelector(state => state.restaurant.loading);
  const error = useSelector(state => state.restaurant.error);
  
  const fetchRestaurantData = async () => {
    // Fetch today's menu
    await dispatch(fetchDailyMenu());
    
    // Fetch restaurant hours
    if (!restaurantHours) {
      await dispatch(fetchRestaurantHours());
    }
  };
  
  useEffect(() => {
    fetchRestaurantData();
  }, []);
  
  const onRefresh = async () => {
    await fetchRestaurantData();
  };

  // Check if restaurant is currently open
  const isRestaurantOpen = () => {
    if (!restaurantHours) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour + (currentMinutes / 60);
    const isWeekend = now.getDay() === 5 || now.getDay() === 6; // Friday or Saturday
    
    const hoursToCheck = isWeekend ? restaurantHours.weekend : restaurantHours.weekdays;
    
    for (const mealTime in hoursToCheck) {
      const openTime = hoursToCheck[mealTime].open.split(':');
      const closeTime = hoursToCheck[mealTime].close.split(':');
      
      const openHour = parseInt(openTime[0]) + (parseInt(openTime[1]) / 60);
      const closeHour = parseInt(closeTime[0]) + (parseInt(closeTime[1]) / 60);
      
      if (currentTime >= openHour && currentTime < closeHour) {
        return { open: true, meal: mealTime };
      }
    }
    
    return { open: false, nextMeal: getNextMeal() };
  };
  
  const getNextMeal = () => {
    if (!restaurantHours) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour + (currentMinutes / 60);
    const isWeekend = now.getDay() === 5 || now.getDay() === 6; // Friday or Saturday
    
    const hoursToCheck = isWeekend ? restaurantHours.weekend : restaurantHours.weekdays;
    let nextMeal = null;
    let nextMealTime = 24;
    
    for (const mealTime in hoursToCheck) {
      const openTime = hoursToCheck[mealTime].open.split(':');
      const openHour = parseInt(openTime[0]) + (parseInt(openTime[1]) / 60);
      
      if (openHour > currentTime && openHour < nextMealTime) {
        nextMealTime = openHour;
        nextMeal = mealTime;
      }
    }
    
    return nextMeal;
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.headerTitle}>{t('restaurant.title')}</Text>
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }
  
  if (error) {
    return (
      <ErrorScreen
        error={error}
        onRetry={onRefresh}
      />
    );
  }
  
  const restaurantStatus = isRestaurantOpen();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t('restaurant.title')}</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {/* Restaurant Status */}
        <View style={[styles.statusCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
            {t('restaurant.status')}
          </Text>
          <View style={[styles.statusBadge, { 
            backgroundColor: restaurantStatus.open ? '#4CAF50' : '#F44336' 
          }]}>
            <Text style={styles.statusText}>
              {restaurantStatus.open 
                ? `${t('restaurant.open')} - ${t(`restaurant.${restaurantStatus.meal}`)}`
                : `${t('restaurant.closed')} ${restaurantStatus.nextMeal 
                    ? `- ${t('restaurant.nextMeal')}: ${t(`restaurant.${restaurantStatus.nextMeal}`)}` 
                    : ''}`
              }
            </Text>
          </View>
        </View>
        
        {/* Hours */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {t('restaurant.hours')}
          </Text>
          {restaurantHours ? (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('restaurant.weekdays')}
              </Text>
              <View style={styles.hoursContainer}>
                <View style={styles.mealTime}>
                  <Text style={[styles.mealName, { color: theme.colors.text }]}>
                    {t('restaurant.breakfast')}
                  </Text>
                  <Text style={[styles.timeText, { color: theme.colors.text }]}>
                    {restaurantHours.weekdays.breakfast.open} - {restaurantHours.weekdays.breakfast.close}
                  </Text>
                </View>
                <View style={styles.mealTime}>
                  <Text style={[styles.mealName, { color: theme.colors.text }]}>
                    {t('restaurant.lunch')}
                  </Text>
                  <Text style={[styles.timeText, { color: theme.colors.text }]}>
                    {restaurantHours.weekdays.lunch.open} - {restaurantHours.weekdays.lunch.close}
                  </Text>
                </View>
                <View style={styles.mealTime}>
                  <Text style={[styles.mealName, { color: theme.colors.text }]}>
                    {t('restaurant.dinner')}
                  </Text>
                  <Text style={[styles.timeText, { color: theme.colors.text }]}>
                    {restaurantHours.weekdays.dinner.open} - {restaurantHours.weekdays.dinner.close}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 16 }]}>
                {t('restaurant.weekend')}
              </Text>
              <View style={styles.hoursContainer}>
                <View style={styles.mealTime}>
                  <Text style={[styles.mealName, { color: theme.colors.text }]}>
                    {t('restaurant.breakfast')}
                  </Text>
                  <Text style={[styles.timeText, { color: theme.colors.text }]}>
                    {restaurantHours.weekend.breakfast.open} - {restaurantHours.weekend.breakfast.close}
                  </Text>
                </View>
                <View style={styles.mealTime}>
                  <Text style={[styles.mealName, { color: theme.colors.text }]}>
                    {t('restaurant.lunch')}
                  </Text>
                  <Text style={[styles.timeText, { color: theme.colors.text }]}>
                    {restaurantHours.weekend.lunch.open} - {restaurantHours.weekend.lunch.close}
                  </Text>
                </View>
                <View style={styles.mealTime}>
                  <Text style={[styles.mealName, { color: theme.colors.text }]}>
                    {t('restaurant.dinner')}
                  </Text>
                  <Text style={[styles.timeText, { color: theme.colors.text }]}>
                    {restaurantHours.weekend.dinner.open} - {restaurantHours.weekend.dinner.close}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={[styles.noDataText, { color: theme.colors.text }]}>
              {t('restaurant.noHoursData')}
            </Text>
          )}
        </View>
        
        {/* Today's Menu */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            {t('restaurant.todaysMenu')}
          </Text>
          
          {dailyMenu ? (
            <View>
              {dailyMenu.meals.breakfast && (
                <View style={styles.menuSection}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {t('restaurant.breakfast')}
                  </Text>
                  <View style={styles.menuItems}>
                    {dailyMenu.meals.breakfast.mainDishes.length > 0 && (
                      <View>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.mainDishes')}
                        </Text>
                        {dailyMenu.meals.breakfast.mainDishes.map((dish, index) => (
                          <Text key={`breakfast-main-${index}`} style={[styles.menuItem, { color: theme.colors.text }]}>
                            • {dish}
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    {dailyMenu.meals.breakfast.sides.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.sides')}
                        </Text>
                        {dailyMenu.meals.breakfast.sides.map((dish, index) => (
                          <Text key={`breakfast-side-${index}`} style={[styles.menuItem, { color: theme.colors.text }]}>
                            • {dish}
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    {dailyMenu.meals.breakfast.drinks.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.drinks')}
                        </Text>
                        {dailyMenu.meals.breakfast.drinks.map((drink, index) => (
                          <Text key={`breakfast-drink-${index}`} style={[styles.menuItem, { color: theme.colors.text }]}>
                            • {drink}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )}
              
              {dailyMenu.meals.lunch && (
                <View style={styles.menuSection}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {t('restaurant.lunch')}
                  </Text>
                  <View style={styles.menuItems}>
                    {dailyMenu.meals.lunch.mainDishes.length > 0 && (
                      <View>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.mainDishes')}
                        </Text>
                        {dailyMenu.meals.lunch.mainDishes.map((dish, index) => (
                          <Text key={`lunch-main-${index}`} style={[styles.menuItem, { color: theme.colors.text }]}>
                            • {dish}
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    {dailyMenu.meals.lunch.sides.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.sides')}
                        </Text>
                        {dailyMenu.meals.lunch.sides.map((dish, index) => (
                          <Text key={`lunch-side-${index}`} style={[styles.menuItem, { color: theme.colors.text }]}>
                            • {dish}
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    {dailyMenu.meals.lunch.desserts.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.desserts')}
                        </Text>
                        {dailyMenu.meals.lunch.desserts.map((dessert, index) => (
                          <Text key={`lunch-dessert-${index}`} style={[styles.menuItem, { color: theme.colors.text }]}>
                            • {dessert}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )}
              
              {dailyMenu.meals.dinner && (
                <View style={styles.menuSection}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {t('restaurant.dinner')}
                  </Text>
                  <View style={styles.menuItems}>
                    {dailyMenu.meals.dinner.mainDishes.length > 0 && (
                      <View>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.mainDishes')}
                        </Text>
                        {dailyMenu.meals.dinner.mainDishes.map((dish, index) => (
                          <Text key={`dinner-main-${index}`} style={[styles.menuItem, { color: theme.colors.text }]}>
                            • {dish}
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    {dailyMenu.meals.dinner.sides.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.sides')}
                        </Text>
                        {dailyMenu.meals.dinner.sides.map((dish, index) => (
                          <Text key={`dinner-side-${index}`} style={[styles.menuItem, { color: theme.colors.text }]}>
                            • {dish}
                          </Text>
                        ))}
                      </View>
                    )}
                    
                    {dailyMenu.meals.dinner.desserts.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.desserts')}
                        </Text>
                        {dailyMenu.meals.dinner.desserts.map((dessert, index) => (
                          <Text key={`dinner-dessert-${index}`} style={[styles.menuItem, { color: theme.colors.text }]}>
                            • {dessert}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )}
              
              {dailyMenu.note && (
                <View style={styles.noteContainer}>
                  <Text style={[styles.noteText, { color: theme.colors.text }]}>
                    {dailyMenu.note}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.noDataText, { color: theme.colors.text }]}>
              {t('restaurant.noMenuData')}
            </Text>
          )}
        </View>
        
        {/* Special Notices */}
        {restaurantHours && restaurantHours.specialHours && restaurantHours.specialHours.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              {t('restaurant.specialNotices')}
            </Text>
            {restaurantHours.specialHours.map((special, index) => (
              <View key={`special-${index}`} style={styles.specialNotice}>
                <Text style={[styles.specialDate, { color: theme.colors.primary }]}>
                  {special.date}
                </Text>
                <Text style={[styles.specialReason, { color: theme.colors.text }]}>
                  {special.reason}
                </Text>
                <Text style={[styles.specialHours, { color: theme.colors.text }]}>
                  {special.hours}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  content: {
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hoursContainer: {
    marginBottom: 8,
  },
  mealTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  mealName: {
    fontSize: 15,
  },
  timeText: {
    fontSize: 15,
  },
  menuSection: {
    marginBottom: 16,
  },
  menuItems: {
    paddingLeft: 8,
  },
  menuCategory: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItem: {
    fontSize: 14,
    paddingVertical: 2,
  },
  noteContainer: {
    padding: 8,
    backgroundColor: '#FFF9C4',
    borderRadius: 4,
    marginTop: 8,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  noDataText: {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  specialNotice: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  specialDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specialReason: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  specialHours: {
    fontSize: 14,
  },
});