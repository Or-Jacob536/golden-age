// app/(tabs)/restaurant.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabView, TabBar } from 'react-native-tab-view';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../contexts/ThemeContext';
import { fetchRestaurantHours, fetchDailyMenu } from '../../store/slices/restaurantSlice';
import { format, isToday, parseISO, addDays } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import i18n from '../../lib/i18n';
import CalendarStrip from 'react-native-calendar-strip';
import MenuTab from '../../components/restaurant/MenuTab';
import RestaurantHoursTab from '../../components/restaurant/RestaurantHoursTab';
import ErrorScreen from '../../components/common/ErrorScreen';

export default function RestaurantScreen() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const dispatch = useDispatch();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  const dailyMenu = useSelector(state => state.restaurant.dailyMenu);
  const restaurantHours = useSelector(state => state.restaurant.hours);
  const loading = useSelector(state => state.restaurant.loading);
  const error = useSelector(state => state.restaurant.error);
  
  const locale = i18n.language === 'he' ? he : enUS;
  
  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    { key: 'menu', title: t('restaurant.menu') },
    { key: 'hours', title: t('restaurant.hours') },
  ]);
  
  const fetchRestaurantData = async (date) => {
    if (tabIndex === 0) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      await dispatch(fetchDailyMenu(formattedDate));
    }
    
    if (!restaurantHours) {
      await dispatch(fetchRestaurantHours());
    }
  };
  
  useEffect(() => {
    fetchRestaurantData(selectedDate);
  }, [selectedDate, tabIndex]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRestaurantData(selectedDate);
    setRefreshing(false);
  };
  
  const handleDateChange = (date) => {
    setSelectedDate(date.toDate());
  };
  
  const getDateLabel = (date) => {
    if (isToday(date)) {
      return t('restaurant.today');
    } else {
      return format(date, 'EEEE, d MMMM', { locale });
    }
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
  
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'menu':
        return (
          <MenuTab
            dailyMenu={dailyMenu}
            selectedDate={selectedDate}
            loading={loading}
            error={error}
            refreshing={refreshing}
            onRefresh={onRefresh}
            theme={theme}
          />
        );
      case 'hours':
        return (
          <RestaurantHoursTab
            restaurantHours={restaurantHours}
            loading={loading}
            error={error}
            refreshing={refreshing}
            onRefresh={onRefresh}
            theme={theme}
          />
        );
      default:
        return null;
    }
  };
  
  if (error && !refreshing) {
    return (
      <ErrorScreen
        error={error}
        onRetry={onRefresh}
      />
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t('restaurant.title')}</Text>
      </View>
      
      {tabIndex === 0 && (
        <CalendarStrip
        scrollable
        style={[styles.calendar, { backgroundColor: theme.colors.background }]}
        calendarColor={theme.colors.background}
        highlightDateNumberStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
        highlightDateNameStyle={{ color: theme.colors.primary }}
        dateNumberStyle={{ color: theme.colors.text }}
        dateNameStyle={{ color: theme.colors.text }}
        iconContainer={{ flex: 0.1 }}
        selectedDate={selectedDate}
        onDateSelected={handleDateChange}
        startingDate={new Date()}
        minDate={new Date()}
        maxDate={addDays(new Date(), 7)}
        // Replace the string locale with a proper locale object
        locale={{
          name: i18n.language,
          config: i18n.language === 'he' ? {
            monthNames: [
              'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
              'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
            ],
            dayNames: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
            dayNamesShort: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
          } : {
            monthNames: [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ],
            dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          }
        }}
      />
      
      )}
      
      {tabIndex === 0 && (
        <View style={styles.dateHeaderContainer}>
          <Text style={[styles.dateHeader, { color: theme.colors.text }]}>
            {getDateLabel(selectedDate)}
          </Text>
        </View>
      )}
      
      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        renderTabBar={renderTabBar}
      />
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
  calendar: {
    height: 100,
    paddingTop: 10,
    paddingBottom: 10,
  },
  dateHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
