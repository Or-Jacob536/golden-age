// components/medical/MedicationItem.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';

const MedicationItem = ({ medication, theme }) => {
  return (
    <Card style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Card.Content>
        <View style={styles.headerRow}>
          <View style={styles.nameContainer}>
            <FontAwesome5 
              name="pills" 
              size={16} 
              color={theme.colors.primary} 
              style={styles.pillIcon}
            />
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {medication.name}
            </Text>
          </View>
          <Text style={[styles.dosage, { color: theme.colors.text }]}>
            {medication.dosage}
          </Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <FontAwesome5 
              name="clock" 
              size={14} 
              color={theme.colors.primary} 
              style={styles.detailIcon}
            />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {medication.frequency}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <FontAwesome5 
              name="info-circle" 
              size={14} 
              color={theme.colors.primary} 
              style={styles.detailIcon}
            />
            <Text style={[styles.detailText, { color: theme.colors.text }]}>
              {medication.purpose}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillIcon: {
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dosage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    marginBottom: 8,
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 8,
    width: 16,
  },
  detailText: {
    fontSize: 14,
  },
});

export default MedicationItem;
