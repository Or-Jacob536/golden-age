// lib/utils/dateUtils.js
import { format, isToday, isTomorrow, parseISO, formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import i18n from '../i18n';

/**
 * Format a date string based on the current app language
 * @param {string|Date} date - The date to format
 * @param {string} formatString - The format pattern to use
 * @returns {string} The formatted date string
 */
export const formatDate = (date, formatString = 'PPP') => {
  try {
    const locale = i18n.language === 'he' ? he : enUS;
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatString, { locale });
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

/**
 * Get a friendly date label (Today, Tomorrow, or formatted date)
 * @param {string|Date} date - The date to format
 * @returns {string} A user-friendly date string
 */
export const getFriendlyDateLabel = (date) => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(parsedDate)) {
      return i18n.t('home.today');
    } else if (isTomorrow(parsedDate)) {
      return i18n.t('activities.tomorrow');
    } else {
      return formatDate(parsedDate, 'EEEE, d MMMM');
    }
  } catch (error) {
    console.error('Error getting friendly date label:', error);
    return String(date);
  }
};

/**
 * Format a time string in 24-hour format (HH:mm) to a localized time
 * @param {string} timeString - Time string in 24-hour format (e.g., "14:30")
 * @returns {string} Localized time string
 */
export const formatTime = (timeString) => {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0);
    
    const locale = i18n.language === 'he' ? he : enUS;
    return format(date, 'p', { locale });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Format a relative time (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} A relative time string
 */
export const formatRelativeTime = (date) => {
  try {
    const locale = i18n.language === 'he' ? he : enUS;
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsedDate, { addSuffix: true, locale });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return String(date);
  }
};

/**
 * Get locale configuration for calendar components
 * @returns {Object} Locale configuration object
 */
export const getCalendarLocale = () => {
    const currentLanguage = i18n.language;
    
    return {
      name: currentLanguage,
      config: currentLanguage === 'he' ? {
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
    };
  };
  
