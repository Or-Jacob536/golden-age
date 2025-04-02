// app/(tabs)/messages.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import { Searchbar, FAB, Badge, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../contexts/ThemeContext';
import { AuthContext } from '../../contexts/AuthContext';
import { fetchMessages } from '../../store/slices/messagesSlice';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import i18n from '../../lib/i18n';
import { router } from 'expo-router';
import ErrorScreen from '../../components/common/ErrorScreen';
import EmergencyButton from '../../components/common/EmergencyButton';

export default function MessagesScreen() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const { isLoggedIn } = useContext(AuthContext);
  const dispatch = useDispatch();
  
  const messages = useSelector(state => state.messages.messages);
  const loading = useSelector(state => state.messages.loading);
  const error = useSelector(state => state.messages.error);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const locale = i18n.language === 'he' ? he : enUS;
  
  const fetchMessagesData = async () => {
    if (!isLoggedIn) return;
    await dispatch(fetchMessages());
  };
  
  useEffect(() => {
    fetchMessagesData();
  }, [isLoggedIn]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessagesData();
    setRefreshing(false);
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  const filteredMessages = messages.filter(message => {
    const content = message.content?.toLowerCase() || '';
    const senderName = message.sender?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return content.includes(query) || senderName.includes(query);
  });
  
  const getFormattedTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale });
    } catch (error) {
      return timestamp;
    }
  };
  
  const handleMessagePress = (message) => {
    router.push(`/message/${message.id}`);
  };
  
  const renderMessageItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleMessagePress(item)}>
        <Card 
          style={[
            styles.messageCard, 
            { backgroundColor: theme.colors.card },
            !item.read && styles.unreadCard
          ]}
        >
          <View style={styles.messageSenderRow}>
            <Text style={[styles.senderName, { color: theme.colors.text }]}>
              {item.sender?.name}
            </Text>
            {!item.read && (
              <Badge style={styles.unreadBadge}>
                {t('messages.new')}
              </Badge>
            )}
          </View>
          
          <Text 
            style={[
              styles.messageContent, 
              { color: theme.colors.text },
              !item.read && styles.unreadText
            ]}
            numberOfLines={2}
          >
            {item.content}
          </Text>
          
          <Text style={[styles.messageTime, { color: theme.colors.text }]}>
            {getFormattedTime(item.createdAt)}
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome5 
        name="envelope-open" 
        size={50} 
        color={theme.colors.text} 
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        {searchQuery ? t('messages.noSearchResults') : t('messages.noMessages')}
      </Text>
    </View>
  );
  
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
  
  if (error && !refreshing) {
    return (
      <ErrorScreen
        error={error}
        onRetry={fetchMessagesData}
      />
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>{t('messages.title')}</Text>
      </View>
      
      <Searchbar
        placeholder={t('messages.search')}
        onChangeText={handleSearch}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: theme.colors.card }]}
        inputStyle={{ color: theme.colors.text }}
        iconColor={theme.colors.primary}
        placeholderTextColor={theme.colors.text + '80'}
      />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        // app/(tabs)/messages.js (continued)
        onPress={() => router.push('/new-message')}
      />
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
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 80,
  },
  messageCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  messageSenderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  unreadBadge: {
    backgroundColor: '#4A90E2',
  },
  messageContent: {
    fontSize: 16,
    marginBottom: 8,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  messageTime: {
    fontSize: 12,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});



