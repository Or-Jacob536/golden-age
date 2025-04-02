import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { TextInput, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { sendMessage } from '../store/slices/messagesSlice';
import { router } from 'expo-router';
import ErrorScreen from '../components/common/ErrorScreen';
import EmergencyButton from '../components/common/EmergencyButton';

export default function NewMessageScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const dispatch = useDispatch();
  
  const [recipient, setRecipient] = useState(params.recipientName || '');
  const [recipientId, setRecipientId] = useState(params.recipientId || '');
  const [subject, setSubject] = useState(params.subject || '');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  
  const loading = useSelector(state => state.messages.loading);
  const error = useSelector(state => state.messages.error);
  
  useEffect(() => {
    if (params.recipientId) {
      setRecipientId(params.recipientId);
    }
    if (params.recipientName) {
      setRecipient(params.recipientName);
    }
    if (params.subject) {
      setSubject(params.subject);
    }
  }, [params]);
  
  const handleSend = async () => {
    if (!content.trim()) {
      Alert.alert(
        t('newMessage.error'),
        t('newMessage.emptyMessage')
      );
      return;
    }
    
    setSending(true);
    
    try {
      await dispatch(sendMessage({
        recipientId: parseInt(recipientId, 10),
        subject,
        content,
      })).unwrap();
      
      Alert.alert(
        t('newMessage.success'),
        t('newMessage.messageSent'),
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/messages'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t('newMessage.error'),
        error.message || t('newMessage.sendError')
      );
    } finally {
      setSending(false);
    }
  };
  
  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.notLoggedInContainer}>
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
  
  if (error && !sending) {
    return (
      <ErrorScreen
        error={error}
        onBack={() => router.back()}
      />
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t('messages.compose')}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          label={t('messages.to')}
          value={recipient}
          onChangeText={setRecipient}
          style={[styles.input, { backgroundColor: theme.colors.card }]}
          mode="outlined"
          disabled={!!params.recipientId}
          theme={{ colors: { primary: theme.colors.primary, text: theme.colors.text } }}
        />
        
        <TextInput
          label={t('messages.subject')}
          value={subject}
          onChangeText={setSubject}
          style={[styles.input, { backgroundColor: theme.colors.card }]}
          mode="outlined"
          theme={{ colors: { primary: theme.colors.primary, text: theme.colors.text } }}
        />
        
        <TextInput
          label={t('messages.message')}
          value={content}
          onChangeText={setContent}
          style={[styles.messageInput, { backgroundColor: theme.colors.card }]}
          mode="outlined"
          multiline
          numberOfLines={10}
          theme={{ colors: { primary: theme.colors.primary, text: theme.colors.text } }}
        />
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={() => router.back()}
          style={[styles.button, { borderColor: theme.colors.border }]}
          labelStyle={{ color: theme.colors.text }}
          disabled={sending || loading}
        >
          {t('common.cancel')}
        </Button>
        
        <Button 
          mode="contained" 
          onPress={handleSend}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          loading={sending || loading}
          disabled={sending || loading || !content.trim()}
        >
          {t('messages.send')}
        </Button>
      </View>
      <EmergencyButton />
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  input: {
    marginBottom: 16,
  },
  messageInput: {
    marginBottom: 16,
    height: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
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
});
