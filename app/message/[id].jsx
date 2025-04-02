// app/message/[id].js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { Button, Card, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import { fetchMessageDetails, markMessageAsRead, deleteMessage } from '../../store/slices/messagesSlice';
import { format, parseISO } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import i18n from '../../lib/i18n';
import { router } from 'expo-router';
import ErrorScreen from '../../components/common/ErrorScreen';
import EmergencyButton from '../../components/common/EmergencyButton';

export default function MessageDetailsScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const dispatch = useDispatch();
  
  const messageDetails = useSelector(state => state.messages.messageDetails);
  const loading = useSelector(state => state.messages.loading);
  const error = useSelector(state => state.messages.error);
  
  const locale = i18n.language === 'he' ? he : enUS;
  
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchMessageDetails(id));
      
      // Mark message as read
      if (messageDetails && !messageDetails.read) {
        dispatch(markMessageAsRead(id));
      }
    }
  }, [id, isLoggedIn]);
  
  const handleReply = () => {
    router.push({
      pathname: '/new-message',
      params: { 
        recipientId: messageDetails.sender.id,
        recipientName: messageDetails.sender.name,
        subject: `Re: ${messageDetails.subject || ''}`.trim()
      }
    });
  };
  
  const handleDelete = () => {
    Alert.alert(
      t('messageDetails.deleteConfirmTitle'),
      t('messageDetails.deleteConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteMessage(id)).unwrap();
              router.back();
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert(
                t('messageDetails.error'),
                t('messageDetails.deleteError')
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'PPpp', { locale });
    } catch (error) {
      return dateString;
    }
  };
  
  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.notLoggedInContainer}>
          <FontAwesome5 
            name="lock" 
            size={50} 
            color={theme.colors.text} 
            style={styles.emptyIcon}
          />
          <Text style={[styles.notLoggedInText, { color: theme.colors.text }]}>
            {t('messages.loginRequired')}
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>{t('auth.loginButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (error) {
    return (
      <ErrorScreen
        error={error}
        onRetry={() => dispatch(fetchMessageDetails(id))}
        onBack={() => router.back()}
      />
    );
  }
  
  if (!messageDetails) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {t('messageDetails.notFound')}
        </Text>
        <Button 
          mode="contained" 
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
        >
          {t('common.back')}
        </Button>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t('messages.details')}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.messageCard, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <View style={styles.messageHeader}>
              <Text style={[styles.subjectText, { color: theme.colors.text }]}>
                {messageDetails.subject || t('messageDetails.noSubject')}
              </Text>
              
              <View style={styles.senderInfo}>
                <Text style={[styles.fromLabel, { color: theme.colors.text }]}>
                  {t('messages.from')}:
                </Text>
                <Text style={[styles.senderName, { color: theme.colors.text }]}>
                  {messageDetails.sender.name}
                </Text>
              </View>
              
              <Text style={[styles.messageDate, { color: theme.colors.text }]}>
                {formatDate(messageDetails.createdAt)}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.messageBody}>
              <Text style={[styles.messageContent, { color: theme.colors.text }]}>
                {messageDetails.content}
              </Text>
            </View>
            
            {messageDetails.attachments && messageDetails.attachments.length > 0 && (
              <View style={styles.attachmentsSection}>
                <Divider style={styles.divider} />
                <Text style={[styles.attachmentsTitle, { color: theme.colors.text }]}>
                  {t('messageDetails.attachments')}
                </Text>
                
                {messageDetails.attachments.map((attachment, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.attachmentItem}
                    onPress={() => console.log('Open attachment:', attachment)}
                  >
                    <FontAwesome5 
                      name="paperclip" 
                      size={16} 
                      color={theme.colors.primary}
                      style={styles.attachmentIcon}
                    />
                    <Text style={[styles.attachmentName, { color: theme.colors.primary }]}>
                      {attachment.name || `${t('messageDetails.attachment')} ${index + 1}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      <View style={styles.actionButtonsContainer}>
        <Button 
          mode="outlined" 
          icon="reply"
          onPress={handleReply}
          style={[styles.actionButton, { borderColor: theme.colors.primary }]}
          labelStyle={{ color: theme.colors.primary }}
        >
          {t('messages.reply')}
        </Button>
        
        <Button 
          mode="outlined" 
          icon="delete"
          onPress={handleDelete}
          style={[styles.actionButton, { borderColor: theme.colors.error }]}
          labelStyle={{ color: theme.colors.error }}
        >
          {t('messages.delete')}
        </Button>
      </View>
      <EmergencyButton />
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
    marginBottom: 20,
  },
  backButton: {
    marginTop: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  messageCard: {
    borderRadius: 10,
  },
  messageHeader: {
    marginBottom: 16,
  },
  subjectText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  senderInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fromLabel: {
    fontSize: 16,
    marginRight: 6,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageDate: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
  },
  messageBody: {
    marginBottom: 24,
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  attachmentsSection: {
    marginBottom: 16,
  },
  attachmentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentIcon: {
    marginRight: 8,
  },
  attachmentName: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: 'transparent',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
});
