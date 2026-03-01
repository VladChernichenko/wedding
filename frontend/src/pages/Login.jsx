import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { login, BASE } from '../api/client';

export default function Login() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const hasError = searchParams.get('error') != null;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(hasError ? t('login.error') : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { res, ok } = await login(username, password);
      if (ok) {
        window.location.href = `${BASE}/`;
        return;
      }
      setError(t('login.error'));
    } catch (err) {
      console.error('[LOGIN] Exception:', err);
      setError(t('login.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="lang-switcher lang-switcher-login">
        <LanguageSwitcher />
      </div>
      <main className="invitation login-box">
        <h1>{t('login.title')}</h1>
        <p className="intro">{t('login.intro')}</p>
        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">{t('login.username')}</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            autoFocus
          />
          <label htmlFor="password">{t('login.password')}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit" disabled={submitting}>
            {t('login.submit')}
          </button>
        </form>
      </main>
    </>
  );
}