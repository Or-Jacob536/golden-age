// components/restaurant/MenuTab.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Title, Paragraph, Divider, Button } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';
import MealSection from './MealSection';

const MenuTab = ({
  dailyMenu,
  selectedDate,
  loading,
  error,
  refreshing,
  onRefresh,
  theme,
}) => {
  const { t } = useTranslation();
  
  const renderMealSections = () => {
    if (!dailyMenu || !dailyMenu.meals) {
      return (
        <Text style={[styles.noMenuText, { color: theme.colors.text }]}>
          {t('restaurant.noMenuData')}
        </Text>
      );
    }
    
    const { breakfast, lunch, dinner } = dailyMenu.meals;
    
    return (
      <>
        {breakfast && (
          <MealSection
            title={t('restaurant.breakfast')}
            meal={breakfast}
            icon="sun"
            theme={theme}
          />
        )}
        
        {lunch && (
          <MealSection
            title={t('restaurant.lunch')}
            meal={lunch}
            icon="utensils"
            theme={theme}
          />
        )}
        
        {dinner && (
          <MealSection
            title={t('restaurant.dinner')}
            meal={dinner}
            icon="moon"
            theme={theme}
          />
        )}
      </>
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
      {/* Restaurant Image */}
      <Card style={[styles.restaurantImageCard, { backgroundColor: theme.colors.card }]}>
        <Card.Cover
          source={require('../../assets/images/restaurant.jpg')}
          style={styles.restaurantImage}
        />
      </Card>
      
      {/* Menu */}
      <View style={styles.menuContainer}>
        {renderMealSections()}
      </View>
      
      {/* Dietary Notes */}
      <Card style={[styles.notesCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content>
          <Title style={[styles.notesTitle, { color: theme.colors.text }]}>
            {t('restaurant.dietaryNotes')}
          </Title>
          <Paragraph style={[styles.notesText, { color: theme.colors.text }]}>
            {t('restaurant.dietaryNotesContent')}
          </Paragraph>
          
          <View style={styles.dietaryIconsContainer}>
            <View style={styles.dietaryIconItem}>
              <FontAwesome5 name="seedling" size={24} color={theme.colors.success} style={styles.dietaryIcon} />
              <Text style={[styles.dietaryIconText, { color: theme.colors.text }]}>
                {t('restaurant.vegetarian')}
              </Text>
            </View>
            
            <View style={styles.dietaryIconItem}>
              <FontAwesome5 name="bread-slice" size={24} color={theme.colors.warning} style={styles.dietaryIcon} />
              <Text style={[styles.dietaryIconText, { color: theme.colors.text }]}>
                {t('restaurant.glutenFree')}
              </Text>
            </View>
            
            <View style={styles.dietaryIconItem}>
              <FontAwesome5 name="cheese" size={24} color="#FFA500" style={styles.dietaryIcon} />
              <Text style={[styles.dietaryIconText, { color: theme.colors.text }]}>
                {t('restaurant.dairyFree')}
              </Text>
            </View>
          </View>
          
          <Paragraph style={[styles.additionalNote, { color: theme.colors.text }]}>
            {t('restaurant.additionalDietaryNote')}
          </Paragraph>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for potential emergency button
  },
  restaurantImageCard: {
    marginBottom: 20,
    overflow: 'hidden',
    borderRadius: 10,
  },
  restaurantImage: {
    height: 180,
  },
  menuContainer: {
    marginBottom: 20,
  },
  noMenuText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 40,
    fontStyle: 'italic',
  },
  notesCard: {
    marginBottom: 20,
    borderRadius: 10,
  },
  notesTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    marginBottom: 16,
  },
  dietaryIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  dietaryIconItem: {
    alignItems: 'center',
  },
  dietaryIcon: {
    marginBottom: 8,
  },
  dietaryIconText: {
    fontSize: 14,
    textAlign: 'center',
  },
  additionalNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default MenuTab;
