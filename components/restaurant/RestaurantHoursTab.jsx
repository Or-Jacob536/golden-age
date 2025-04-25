import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Title, Paragraph, Divider, List } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';

const RestaurantHoursTab = ({ restaurantHours, loading, error, refreshing, onRefresh, theme }) => {
  const { t } = useTranslation();
  
  const renderMealTimings = (timings, isWeekend) => {
    if (!timings) return null;
    
    return (
      <Card style={[styles.timingsCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Title style={[styles.timingsTitle, { color: theme.colors.text }]}>
            {isWeekend ? t('restaurant.weekend') : t('restaurant.weekdays')}
          </Title>
          
          <List.Item
            title={t('restaurant.breakfast')}
            description={timings.breakfast || t('restaurant.closed')}
            left={props => <List.Icon {...props} icon="coffee" color={theme.colors.primary} />}
            titleStyle={[styles.mealTypeTitle, { color: theme.colors.text }]}
            descriptionStyle={[styles.mealTypeTime, { color: theme.colors.text }]}
          />
          
          <Divider style={styles.mealDivider} />
          
          <List.Item
            title={t('restaurant.lunch')}
            description={timings.lunch || t('restaurant.closed')}
            left={props => <List.Icon {...props} icon="food-fork-drink" color={theme.colors.primary} />}
            titleStyle={[styles.mealTypeTitle, { color: theme.colors.text }]}
            descriptionStyle={[styles.mealTypeTime, { color: theme.colors.text }]}
          />
          
          <Divider style={styles.mealDivider} />
          
          <List.Item
            title={t('restaurant.dinner')}
            description={timings.dinner || t('restaurant.closed')}
            left={props => <List.Icon {...props} icon="silverware" color={theme.colors.primary} />}
            titleStyle={[styles.mealTypeTitle, { color: theme.colors.text }]}
            descriptionStyle={[styles.mealTypeTime, { color: theme.colors.text }]}
          />
        </Card.Content>
      </Card>
    );
  };
  
  const renderSpecialHours = () => {
    if (!restaurantHours?.specialHours || restaurantHours.specialHours.length === 0) {
      return null;
    }
    
    return (
      <Card style={[styles.specialHoursCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Title style={[styles.specialHoursTitle, { color: theme.colors.text }]}>
            {t('restaurant.specialHours')}
          </Title>
          
          {restaurantHours.specialHours.map((special, index) => (
            <View key={index} style={styles.specialHoursItem}>
              <View style={styles.specialDateContainer}>
                <FontAwesome5 
                  name="calendar-alt" 
                  size={16} 
                  color={theme.colors.primary} 
                  style={styles.specialIcon}
                />
                <Text style={[styles.specialDate, { color: theme.colors.text }]}>
                  {special.date}
                </Text>
              </View>
              
              <View style={styles.specialDetailsContainer}>
                <Text style={[styles.specialHours, { color: theme.colors.text }]}>
                  {special.hours}
                </Text>
                {special.reason && (
                  <Text style={[styles.specialReason, { color: theme.colors.text }]}>
                    {special.reason}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (!restaurantHours) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          {t('restaurant.noHoursData')}
        </Text>
      </View>
    );
  }
  
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
        <Card.Cover
          source={require('../../assets/images/dining-room.jpg')}
          style={styles.diningImage}
        />
        <Card.Content style={styles.infoContent}>
          <Title style={[styles.infoTitle, { color: theme.colors.text }]}>
            {t('restaurant.diningRoom')}
          </Title>
          <Paragraph style={[styles.infoText, { color: theme.colors.text }]}>
            {t('restaurant.diningRoomInfo')}
          </Paragraph>
        </Card.Content>
      </Card>
      
      {renderMealTimings(restaurantHours.weekdays, false)}
      {renderMealTimings(restaurantHours.weekend, true)}
      {renderSpecialHours()}
      
      <Card style={[styles.notesCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Title style={[styles.notesTitle, { color: theme.colors.text }]}>
            {t('restaurant.additionalInfo')}
          </Title>
          <View style={styles.noteItem}>
            <FontAwesome5 
              name="info-circle" 
              size={16} 
              color={theme.colors.primary} 
              style={styles.noteIcon}
            />
            <Text style={[styles.noteText, { color: theme.colors.text }]}>
              {t('restaurant.additionalInfo1')}
            </Text>
          </View>
          <View style={styles.noteItem}>
            <FontAwesome5 
              name="info-circle" 
              size={16} 
              color={theme.colors.primary} 
              style={styles.noteIcon}
            />
            <Text style={[styles.noteText, { color: theme.colors.text }]}>
              {t('restaurant.additionalInfo2')}
            </Text>
          </View>
          <View style={styles.noteItem}>
            <FontAwesome5 
              name="phone" 
              size={16} 
              color={theme.colors.primary} 
              style={styles.noteIcon}
            />
            <Text style={[styles.noteText, { color: theme.colors.text }]}>
              {t('restaurant.diningContact')}: 02-123-4567
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  infoCard: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  diningImage: {
    height: 180,
  },
  infoContent: {
    paddingVertical: 16,
  },
  infoTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
  },
  timingsCard: {
    marginBottom: 20,
    borderRadius: 10,
  },
  timingsTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  mealTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealTypeTime: {
    fontSize: 16,
  },
  mealDivider: {
    marginLeft: 54,
  },
  specialHoursCard: {
    marginBottom: 20,
    borderRadius: 10,
  },
  specialHoursTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  specialHoursItem: {
    marginBottom: 16,
  },
  specialDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  specialIcon: {
    marginRight: 8,
  },
  specialDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  specialDetailsContainer: {
    marginLeft: 24,
  },
  specialHours: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  specialReason: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 2,
  },
  notesCard: {
    marginBottom: 20,
    borderRadius: 10,
  },
  notesTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  noteIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  noteText: {
    fontSize: 16,
    flex: 1,
  },
});

export default RestaurantHoursTab;