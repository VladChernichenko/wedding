import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getI18n } from '../api/client';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState('en');
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (lang = null) => {
    setLoading(true);
    try {
      const data = await getI18n(lang);
      setLocale(data.locale || 'en');
      setMessages(data.messages || {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setLanguage = useCallback((lang) => {
    load(lang);
  }, [load]);

  const t = useCallback((key) => messages[key] ?? key, [messages]);

  return (
    <I18nContext.Provider value={{ locale, messages, setLanguage, t, loading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}