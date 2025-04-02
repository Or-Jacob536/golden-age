// lib/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import en from "./en.json";
import he from "./he.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    he: {
      translation: he,
    },
  },
  lng: getLocales()[0].languageCode === "he" ? "he" : "en",
  fallbackLng: "he",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
