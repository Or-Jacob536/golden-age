import React, { useEffect, useContext, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../contexts/ThemeContext';
import { fetchRestaurantHours, fetchDailyMenu } from '../../store/slices/restaurantSlice';
import ErrorScreen from '../../components/common/ErrorScreen';
import { createSelector } from 'reselect';

// Create memoized selectors
const selectRestaurantState = state => state.restaurant;
const selectDailyMenu = createSelector(
  [selectRestaurantState],
  restaurant => restaurant.dailyMenu
);
const selectRestaurantHours = createSelector(
  [selectRestaurantState],
  restaurant => restaurant.hours
);
const selectLoading = createSelector(
  [selectRestaurantState],
  restaurant => restaurant.loading
);
const selectError = createSelector(
  [selectRestaurantState],
  restaurant => restaurant.error
);

export default function RestaurantScreen() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  
  // Use memoized selectors
  const dailyMenu = useSelector(selectDailyMenu);
  const restaurantHours = useSelector(selectRestaurantHours);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  const fetchRestaurantData = useCallback(async () => {
    // Fetch today's menu
    await dispatch(fetchDailyMenu());
    
    // Fetch restaurant hours if not already loaded
    if (!restaurantHours) {
      await dispatch(fetchRestaurantHours());
    }
  }, [dispatch, restaurantHours]);
  
  useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);
  
  // Memoize the calculation of restaurant open status
  const restaurantStatus = useMemo(() => {
    if (!restaurantHours) return { open: false, nextMeal: null };
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour + (currentMinutes / 60);
    const isWeekend = now.getDay() === 5 || now.getDay() === 6; // Friday or Saturday
    
    const hoursToCheck = isWeekend ? restaurantHours.weekend : restaurantHours.weekdays;
    
    // Safety check for missing hours data
    if (!hoursToCheck) return { open: false, nextMeal: null };
    
    // Check if currently open
    for (const mealTime in hoursToCheck) {
      if (!hoursToCheck[mealTime] || !hoursToCheck[mealTime].open || !hoursToCheck[mealTime].close) continue;
      
      const openTimeParts = hoursToCheck[mealTime].open.split(':');
      const closeTimeParts = hoursToCheck[mealTime].close.split(':');
      
      if (openTimeParts.length !== 2 || closeTimeParts.length !== 2) continue;
      
      const openHour = parseInt(openTimeParts[0]) + (parseInt(openTimeParts[1]) / 60);
      const closeHour = parseInt(closeTimeParts[0]) + (parseInt(closeTimeParts[1]) / 60);
      
      if (currentTime >= openHour && currentTime < closeHour) {
        return { open: true, meal: mealTime };
      }
    }
    
    // Find next meal
    let nextMeal = null;
    let nextMealTime = 24;
    
    for (const mealTime in hoursToCheck) {
      if (!hoursToCheck[mealTime] || !hoursToCheck[mealTime].open) continue;
      
      const openTimeParts = hoursToCheck[mealTime].open.split(':');
      if (openTimeParts.length !== 2) continue;
      
      const openHour = parseInt(openTimeParts[0]) + (parseInt(openTimeParts[1]) / 60);
      
      if (openHour > currentTime && openHour < nextMealTime) {
        nextMealTime = openHour;
        nextMeal = mealTime;
      }
    }
    
    return { open: false, nextMeal };
  }, [restaurantHours]);
  
  // Safely render menu items with null checks
  const renderMenuItems = useCallback((items, keyPrefix) => {
    if (!items || items.length === 0) return null;
    
    return items.map((item, index) => (
      <Text key={`${keyPrefix}-${index}`} style={[styles.menuItem, { color: theme.colors.text }]}>
        • {item}
      </Text>
    ));
  }, [theme.colors.text]);
  
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
        onRetry={fetchRestaurantData}
      />
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t('restaurant.title')}</Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRestaurantData} />
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
          {restaurantHours && restaurantHours.weekdays && restaurantHours.weekend ? (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('restaurant.weekdays')}
              </Text>
              <View style={styles.hoursContainer}>
                {restaurantHours.weekdays.breakfast && (
                  <View style={styles.mealTime}>
                    <Text style={[styles.mealName, { color: theme.colors.text }]}>
                      {t('restaurant.breakfast')}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.colors.text }]}>
                      {restaurantHours.weekdays.breakfast.open} - {restaurantHours.weekdays.breakfast.close}
                    </Text>
                  </View>
                )}
                {restaurantHours.weekdays.lunch && (
                  <View style={styles.mealTime}>
                    <Text style={[styles.mealName, { color: theme.colors.text }]}>
                      {t('restaurant.lunch')}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.colors.text }]}>
                      {restaurantHours.weekdays.lunch.open} - {restaurantHours.weekdays.lunch.close}
                    </Text>
                  </View>
                )}
                {restaurantHours.weekdays.dinner && (
                  <View style={styles.mealTime}>
                    <Text style={[styles.mealName, { color: theme.colors.text }]}>
                      {t('restaurant.dinner')}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.colors.text }]}>
                      {restaurantHours.weekdays.dinner.open} - {restaurantHours.weekdays.dinner.close}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 16 }]}>
                {t('restaurant.weekend')}
              </Text>
              <View style={styles.hoursContainer}>
                {restaurantHours.weekend.breakfast && (
                  <View style={styles.mealTime}>
                    <Text style={[styles.mealName, { color: theme.colors.text }]}>
                      {t('restaurant.breakfast')}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.colors.text }]}>
                      {restaurantHours.weekend.breakfast.open} - {restaurantHours.weekend.breakfast.close}
                    </Text>
                  </View>
                )}
                {restaurantHours.weekend.lunch && (
                  <View style={styles.mealTime}>
                    <Text style={[styles.mealName, { color: theme.colors.text }]}>
                      {t('restaurant.lunch')}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.colors.text }]}>
                      {restaurantHours.weekend.lunch.open} - {restaurantHours.weekend.lunch.close}
                    </Text>
                  </View>
                )}
                {restaurantHours.weekend.dinner && (
                  <View style={styles.mealTime}>
                    <Text style={[styles.mealName, { color: theme.colors.text }]}>
                      {t('restaurant.dinner')}
                    </Text>
                    <Text style={[styles.timeText, { color: theme.colors.text }]}>
                      {restaurantHours.weekend.dinner.open} - {restaurantHours.weekend.dinner.close}
                    </Text>
                  </View>
                )}
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
          
          {dailyMenu && dailyMenu.meals ? (
            <View>
              {dailyMenu.meals.breakfast && (
                <View style={styles.menuSection}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    {t('restaurant.breakfast')}
                  </Text>
                  <View style={styles.menuItems}>
                    {dailyMenu.meals.breakfast.mainDishes && dailyMenu.meals.breakfast.mainDishes.length > 0 && (
                      <View>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.mainDishes')}
                        </Text>
                        {renderMenuItems(dailyMenu.meals.breakfast.mainDishes, 'breakfast-main')}
                      </View>
                    )}
                    
                    {dailyMenu.meals.breakfast.sides && dailyMenu.meals.breakfast.sides.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.sides')}
                        </Text>
                        {renderMenuItems(dailyMenu.meals.breakfast.sides, 'breakfast-side')}
                      </View>
                    )}
                    
                    {dailyMenu.meals.breakfast.drinks && dailyMenu.meals.breakfast.drinks.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.drinks')}
                        </Text>
                        {renderMenuItems(dailyMenu.meals.breakfast.drinks, 'breakfast-drink')}
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
                    {dailyMenu.meals.lunch.mainDishes && dailyMenu.meals.lunch.mainDishes.length > 0 && (
                      <View>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.mainDishes')}
                        </Text>
                        {renderMenuItems(dailyMenu.meals.lunch.mainDishes, 'lunch-main')}
                      </View>
                    )}
                    
                    {dailyMenu.meals.lunch.sides && dailyMenu.meals.lunch.sides.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.sides')}
                        </Text>
                        {renderMenuItems(dailyMenu.meals.lunch.sides, 'lunch-side')}
                      </View>
                    )}
                    
                    {dailyMenu.meals.lunch.desserts && dailyMenu.meals.lunch.desserts.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.desserts')}
                        </Text>
                        {renderMenuItems(dailyMenu.meals.lunch.desserts, 'lunch-dessert')}
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
                    {dailyMenu.meals.dinner.mainDishes && dailyMenu.meals.dinner.mainDishes.length > 0 && (
                      <View>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.mainDishes')}
                        </Text>
                        {renderMenuItems(dailyMenu.meals.dinner.mainDishes, 'dinner-main')}
                      </View>
                    )}
                    
                    {dailyMenu.meals.dinner.sides && dailyMenu.meals.dinner.sides.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.sides')}
                        </Text>
                        {renderMenuItems(dailyMenu.meals.dinner.sides, 'dinner-side')}
                      </View>
                    )}
                    
                    {dailyMenu.meals.dinner.desserts && dailyMenu.meals.dinner.desserts.length > 0 && (
                      <View style={{marginTop: 8}}>
                        <Text style={[styles.menuCategory, { color: theme.colors.text }]}>
                          {t('restaurant.desserts')}
                        </Text>
                        {renderMenuItems(dailyMenu.meals.dinner.desserts, 'dinner-dessert')}
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

// Using the existing styles from your component
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