import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { confirmPresence, addChild } from '../api/client';

const EVENT_DATE = new Date('2026-09-04');

function getDaysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}

export default function Invitation({ user, onRefreshUser }) {
  const { t } = useI18n();
  const daysLeft = useMemo(() => getDaysUntil(EVENT_DATE), []);
  const [childName, setChildName] = useState('');
  const [addingChild, setAddingChild] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [childError, setChildError] = useState('');

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

  const handleConfirmPresence = async () => {
    setConfirming(true);
    try {
      await confirmPresence();
      onRefreshUser?.();
    } finally {
      setConfirming(false);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!childName.trim()) return;
    setChildError('');
    setAddingChild(true);
    try {
      await addChild(childName);
      setChildName('');
      onRefreshUser?.();
    } catch (err) {
      setChildError(err.message || t('admin.error'));
    } finally {
      setAddingChild(false);
    }
  };

  const isGuest = user?.guest === true;
  const hasPartner = !!user?.partnerName;
  const confirmLabel = hasPartner ? t('rsvp.confirmWe') : t('rsvp.confirmI');

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
      <p className="rsvp">{t('rsvp')}</p>

      {isGuest && (
        <div className="rsvp-block">
          {user.presenceConfirmed ? (
            <p className="rsvp-confirmed">{t('rsvp.confirmed')}</p>
          ) : (
            <button
              type="button"
              className="rsvp-confirm-button"
              onClick={handleConfirmPresence}
              disabled={confirming}
            >
              {confirmLabel}
            </button>
          )}

          <div className="rsvp-children">
            <p className="rsvp-children-title">{t('rsvp.children')}</p>
            {user.children?.length > 0 && (
              <ul className="rsvp-children-list">
                {user.children.map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
              </ul>
            )}
            <form onSubmit={handleAddChild} className="rsvp-add-child">
              <label htmlFor="rsvp-child-name">{t('rsvp.childName')}</label>
              {childError && <p className="login-error" role="alert">{childError}</p>}
              <input
                type="text"
                id="rsvp-child-name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                disabled={addingChild}
              />
              <button type="submit" disabled={addingChild || !childName.trim()}>
                {t('rsvp.addChild')}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}