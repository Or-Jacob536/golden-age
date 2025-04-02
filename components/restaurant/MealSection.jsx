// components/restaurant/MealSection.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Divider } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const MealSection = ({ title, meal, icon, theme }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const renderDishes = (dishes, label) => {
    if (!dishes || dishes.length === 0) return null;
    
    return (
      <View style={styles.dishesContainer}>
        <Text style={[styles.dishesLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
        
        {dishes.map((dish, index) => (
          <View key={index} style={styles.dishItem}>
            <FontAwesome5 
              name="circle" 
              size={8} 
              color={theme.colors.primary} 
              style={styles.bulletPoint}
            />
            <Text style={[styles.dishText, { color: theme.colors.text }]}>
              {dish}
            </Text>
          </View>
        ))}
      </View>
    );
  };
  
  return (
    <Card style={[styles.mealCard, { backgroundColor: theme.colors.card }]}>
      <TouchableOpacity
        style={styles.mealHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.mealTitleContainer}>
          <FontAwesome5 
            name={icon} 
            size={20} 
            color={theme.colors.primary} 
            style={styles.mealIcon}
          />
          <Title style={[styles.mealTitle, { color: theme.colors.text }]}>
            {title}
          </Title>
        </View>
        
        <FontAwesome5 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={16} 
          color={theme.colors.text}
        />
      </TouchableOpacity>
      
      {expanded && (
        <Card.Content style={styles.mealContent}>
          <Divider style={styles.divider} />
          
          {renderDishes(meal.mainDishes, t('restaurant.mainDishes'))}
          {renderDishes(meal.sides, t('restaurant.sides'))}
          {renderDishes(meal.desserts, t('restaurant.desserts'))}
          {renderDishes(meal.drinks, t('restaurant.drinks'))}
          
          {!meal.mainDishes && !meal.sides && !meal.desserts && !meal.drinks && (
            <Text style={[styles.noItemsText, { color: theme.colors.text }]}>
              {t('restaurant.noMealItems')}
            </Text>
          )}
        </Card.Content>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  mealCard: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    marginRight: 12,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 0,
  },
  mealContent: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  divider: {
    marginBottom: 16,
  },
  dishesContainer: {
    marginBottom: 16,
  },
  dishesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bulletPoint: {
    marginRight: 8,
  },
  dishText: {
    fontSize: 16,
  },
  noItemsText: {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

export default MealSection;