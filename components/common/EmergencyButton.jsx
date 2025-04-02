// components/common/EmergencyButton.jsx
import React, { useState, useContext } from 'react';
import {
View,
Text,
StyleSheet,
TouchableOpacity,
Modal,
Animated,
Vibration,
Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

const EmergencyButton = () => {
const { t } = useTranslation();
const { theme } = useContext(ThemeContext);

const [modalVisible, setModalVisible] = useState(false);
const [countdown, setCountdown] = useState(3);
const [emergency, setEmergency] = useState(false);
const [pulseAnim] = useState(new Animated.Value(1));

const startPulse = () => {
  Animated.sequence([
    Animated.timing(pulseAnim, {
      toValue: 1.2,
      duration: 500,
      useNativeDriver: true,
    }),
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }),
  ]).start(() => {
    if (emergency) {
      startPulse();
    }
  });
};

const handleEmergencyPress = () => {
  // Vibrate phone for haptic feedback
  Vibration.vibrate(200);
  
  // Open confirmation modal
  setModalVisible(true);
};

const handleCancelEmergency = () => {
  setModalVisible(false);
  setCountdown(3);
  setEmergency(false);
};

const handleConfirmEmergency = () => {
  // Start countdown
  setCountdown(3);
  
  // Start countdown timer
  let count = 3;
  const countdownInterval = setInterval(() => {
    count -= 1;
    setCountdown(count);
    
    // Provide haptic feedback for each countdown number
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (count === 0) {
      clearInterval(countdownInterval);
      
      // Activate emergency mode
      setEmergency(true);
      startPulse();
      
      // Simulate emergency alert being sent
      setTimeout(() => {
        Alert.alert(
          t('emergency.alertSent'),
          t('emergency.staffNotified'),
          [
            {
              text: 'OK',
              onPress: () => {
                setEmergency(false);
                setModalVisible(false);
                setCountdown(3);
              },
            },
          ]
        );
      }, 2000);
    }
  }, 1000);
};

return (
  <>
    <TouchableOpacity
      style={[
        styles.emergencyButton,
        { backgroundColor: theme.colors.error }
      ]}
      onPress={handleEmergencyPress}
      activeOpacity={0.7}
    >
      <FontAwesome5 name="exclamation" size={26} color="#ffffff" />
      <Text style={styles.emergencyButtonText}>{t('emergency.button')}</Text>
    </TouchableOpacity>

    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCancelEmergency}
    >
      <View style={styles.centeredView}>
        <View style={[
          styles.modalView,
          { backgroundColor: theme.colors.card }
        ]}>
          {!emergency ? (
            <>
              <Text style={[
                styles.modalTitle,
                { color: theme.colors.text }
              ]}>
                {t('emergency.confirmTitle')}
              </Text>
              
              <Text style={[
                styles.modalText,
                { color: theme.colors.text }
              ]}>
                {t('emergency.confirmMessage')}
              </Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonCancel,
                    { borderColor: theme.colors.border }
                  ]}
                  onPress={handleCancelEmergency}
                >
                    <Text style={[
                      styles.buttonText,
                      { color: theme.colors.text }
                    ]}>
                      {t('emergency.cancel')}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonConfirm,
                      { backgroundColor: theme.colors.error }
                    ]}
                    onPress={handleConfirmEmergency}
                  >
                    <Text style={styles.buttonConfirmText}>
                      {t('emergency.confirm')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.countdownContainer}>
                <Animated.View
                  style={[
                    styles.pulseCircle,
                    {
                      backgroundColor: theme.colors.error,
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <FontAwesome5 name="exclamation" size={40} color="#ffffff" />
                </Animated.View>
                
                <Text style={[
                  styles.emergencyText,
                  { color: theme.colors.error }
                ]}>
                  {t('emergency.sending')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  emergencyButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonConfirm: {
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pulseCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  emergencyText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default EmergencyButton;
