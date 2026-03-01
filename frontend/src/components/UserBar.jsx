import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import { logout } from '../api/client';

export default function UserBar({ user }) {
  const { t } = useI18n();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  return (
    <div className="user-bar">
      {user && (
        <span className="user-bar-text">
          {t('userbar.loggedIn')} <span id="user-name">{user.displayName || user.username}</span>
        </span>
      )}
      <div className="user-bar-right">
        <LanguageSwitcher />
        {user && (
          <form id="logout-form" onSubmit={handleLogout} className="user-bar-form">
            <button type="submit" className="user-bar-logout">
              {t('userbar.logout')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}