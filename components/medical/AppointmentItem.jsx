// components/medical/AppointmentItem.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const AppointmentItem = ({ appointment, theme, isPast = false, onPress }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isPast && styles.pastContainer
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.timeContainer}>
        <Text style={[styles.time, { color: isPast ? theme.colors.text : theme.colors.primary }]}>
          {appointment.time}
        </Text>
        <Text style={[styles.date, { color: theme.colors.text }]}>
          {appointment.date}
        </Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.doctor, { color: theme.colors.text }]}>
          {appointment.doctor}
        </Text>
        <Text style={[styles.specialty, { color: theme.colors.text }]}>
          {appointment.specialty}
        </Text>
        <View style={styles.locationContainer}>
          <FontAwesome5 
            name="map-marker-alt" 
            size={12} 
            color={theme.colors.primary} 
            style={styles.locationIcon}
          />
          <Text style={[styles.location, { color: theme.colors.text }]}>
            {appointment.location}
          </Text>
        </View>
      </View>
      
      <View style={styles.arrowContainer}>
        <FontAwesome5 
          name="chevron-right" 
          size={16} 
          color={theme.colors.primary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  pastContainer: {
    borderLeftColor: '#CCCCCC',
    backgroundColor: 'rgba(204, 204, 204, 0.1)',
  },
  timeContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  infoContainer: {
    flex: 1,
  },
  doctor: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
  },
  location: {
    fontSize: 12,
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
});

export default AppointmentItem;