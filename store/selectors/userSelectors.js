// store/selectors/userSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Simple selectors with transformations
export const selectUserLoading = state => Boolean(state.user.loading);
export const selectUserError = state => state.user.error || null;

// User selectors with transformations
export const selectUserProfile = createSelector(
  [state => state.user.profile],
  (profile) => profile ? { ...profile } : null
);

export const selectUserSettings = createSelector(
  [state => state.user.settings],
  (settings) => settings ? { ...settings } : null
);

// Derived selectors
export const selectIsUserLoggedIn = createSelector(
  [selectUserProfile],
  (profile) => Boolean(profile)
);

export const selectUserRole = createSelector(
  [selectUserProfile],
  (profile) => profile?.role || 'guest'
);

export const selectUserName = createSelector(
  [selectUserProfile],
  (profile) => {
    if (!profile) return '';
    return `${profile.firstName} ${profile.lastName}`;
  }
);

export const selectUserLanguage = createSelector(
  [selectUserSettings],
  (settings) => settings?.languagePreference || 'he'
);

export const selectIsDarkMode = createSelector(
  [selectUserSettings],
  (settings) => Boolean(settings?.darkMode)
);

export const selectUserFontSize = createSelector(
  [selectUserProfile],
  (profile) => profile?.fontSize || 'medium'
);

export const selectUserContactInfo = createSelector(
  [selectUserProfile],
  (profile) => {
    if (!profile) return null;
    
    return {
      email: profile.email,
      phoneNumber: profile.phoneNumber
    };
  }
);

export const selectUserPreferences = createSelector(
  [selectUserProfile, selectUserSettings],
  (profile, settings) => {
    return {
      language: settings?.languagePreference || 'he',
      darkMode: Boolean(settings?.darkMode),
      fontSize: profile?.fontSize || 'medium'
    };
  }
);