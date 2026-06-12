// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(HttpBackend) // Dynamically loads translation files from your public folder
    .use(LanguageDetector) // Detects browser language settings automatically
    .use(initReactI18next) // Binds i18next to React
    .init({
        fallbackLng: 'en',
        debug: import.meta.env.DEV, // Logs issues only during local development
        interpolation: {
            escapeValue: false, // React protects against XSS injection by default
        },
        backend: {
            // Configures where Vite serves static translation assets
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
    });

export default i18n;
