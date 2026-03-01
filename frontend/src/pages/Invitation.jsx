import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

const EVENT_DATE = new Date('2026-09-04');

function getDaysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

export default function Invitation({ user }) {
  const { t } = useI18n();
  const daysLeft = useMemo(() => getDaysUntil(EVENT_DATE), []);

  let welcomeMessage = '';
  if (user) {
    const name = user.displayName || user.username || '';
    if (user.partnerName) {
      welcomeMessage = t('welcome.withPartner').replace('{0}', name).replace('{1}', user.partnerName);
    } else if (name) {
      welcomeMessage = t('welcome.alone').replace('{0}', name);
    }
  }

  let countdownText = '';
  if (daysLeft > 0) {
    countdownText = t('countdown.days').replace('{0}', String(daysLeft));
  } else if (daysLeft === 0) {
    countdownText = t('countdown.today');
  } else {
    countdownText = t('countdown.passed');
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
        <p className="countdown" aria-live="polite">{countdownText}</p>
      </div>
      <div className="venue">
        <p className="venue-name">{t('venue')}</p>
      </div>
      <p className="rsvp">
        {t('rsvp')}{' '}
        <Link to="/rsvp" className="rsvp-link">{t('rsvp.respond')}</Link>
      </p>
    </main>
  );
}