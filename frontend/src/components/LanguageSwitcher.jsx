import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

const LANGS = [
  { code: 'en', label: 'EN', title: 'English' },
  { code: 'ru', label: 'RU', title: null },
  { code: 'ka', label: 'KA', title: 'Georgian' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { locale, setLanguage } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e, code) => {
    e.preventDefault();
    setLanguage(code);
    const path = location.pathname || '/';
    const params = new URLSearchParams(location.search);
    params.set('lang', code);
    navigate(`${path}?${params.toString()}`, { replace: true });
  };

  return (
    <div className={`lang-switcher ${className}`.trim()}>
      {LANGS.map(({ code, label, title }) => (
        <a
          key={code}
          href={`${location.pathname}?lang=${code}`}
          onClick={(e) => handleClick(e, code)}
          className={locale === code ? 'active' : ''}
          title={title || undefined}
        >
          {label}
        </a>
      ))}
    </div>
  );
}