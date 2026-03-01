import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export default function Invitation({ user }) {
  const { t } = useI18n();

  let welcomeMessage = '';
  if (user) {
    const name = user.displayName || user.username || '';
    if (user.partnerName) {
      welcomeMessage = t('welcome.withPartner').replace('{0}', name).replace('{1}', user.partnerName);
    } else if (name) {
      welcomeMessage = t('welcome.alone').replace('{0}', name);
    }
  }

  return (
    <main className="invitation">
      {user && welcomeMessage && <h2 className="welcome">{welcomeMessage}</h2>}
      {user?.admin && (
        <p className="admin-link">
          <Link to="/admin">{t('welcome.adminLink')}</Link>
        </p>
      )}
      <p className="intro">{t('intro')}</p>
      <h1 className="names">{t('names')}</h1>
      <p className="request">
        <span>{t('request')}</span>
        <br />
        <span>{t('requestLine2')}</span>
      </p>
      <div className="date-block">
        <p className="date">{t('date')}</p>
      </div>
      <div className="venue">
        <p className="venue-name">{t('venue')}</p>
      </div>
      <p className="rsvp">{t('rsvp')}</p>
    </main>
  );
}