import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { confirmPresence, declinePresence, addChild, deleteChild, setTransferNeed, setEmail } from '../api/client';

export default function Rsvp({ user, onRefreshUser }) {
  const { t } = useI18n();
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [addingChild, setAddingChild] = useState(false);
  const [deletingChildId, setDeletingChildId] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [updatingTransfer, setUpdatingTransfer] = useState(false);
  const [childError, setChildError] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    setEmailValue(user?.email || '');
  }, [user?.email]);

  const handleConfirmPresence = async () => {
    setConfirming(true);
    try {
      await confirmPresence();
      onRefreshUser?.();
    } finally {
      setConfirming(false);
    }
  };

  const handleDeclinePresence = async () => {
    setDeclining(true);
    try {
      await declinePresence();
      onRefreshUser?.();
    } finally {
      setDeclining(false);
    }
  };

  const handleSaveEmail = async (e) => {
    e?.preventDefault?.();
    setEmailMessage('');
    setSavingEmail(true);
    try {
      await setEmail(emailValue);
      onRefreshUser?.();
      setEmailMessage(t('rsvp.emailSaved'));
    } catch (err) {
      setEmailMessage(err.message || t('admin.error'));
    } finally {
      setSavingEmail(false);
    }
  };

  const handleTransferNeedChange = async (e) => {
    const need = e.target.checked;
    setUpdatingTransfer(true);
    try {
      await setTransferNeed(need);
      onRefreshUser?.();
    } finally {
      setUpdatingTransfer(false);
    }
  };

  const handleDeleteChild = async (childId) => {
    setDeletingChildId(childId);
    try {
      await deleteChild(childId);
      onRefreshUser?.();
    } catch (err) {
      setChildError(err.message || t('admin.error'));
    } finally {
      setDeletingChildId(null);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!childName.trim()) return;
    setChildError('');
    setAddingChild(true);
    try {
      const ageVal = childAge === '' ? undefined : Number(childAge);
      await addChild(childName, ageVal);
      setChildName('');
      setChildAge('');
      onRefreshUser?.();
    } catch (err) {
      setChildError(err.message || t('admin.error'));
    } finally {
      setAddingChild(false);
    }
  };

  const ageOptions = Array.from({ length: 14 }, (_, i) => i);

  const isGuest = user?.guest === true;
  const hasPartner = !!user?.partnerName;
  const confirmLabel = hasPartner ? t('rsvp.confirmWe') : t('rsvp.confirmI');
  const declineLabel = hasPartner ? t('rsvp.declineWe') : t('rsvp.declineI');

  if (!user) return null;

  return (
    <main className="invitation rsvp-page">
      <div className="rsvp-page-card">
        <header className="rsvp-page-header">
          <h1 className="rsvp-page-title">{t('rsvp.title')}</h1>
          <p className="rsvp-page-intro">{t('rsvp.intro')}</p>
          <div className="rsvp-page-divider" aria-hidden="true" />
        </header>

        {isGuest ? (
          <div className="rsvp-page-body">
            <section className="rsvp-section rsvp-section-email">
              <label htmlFor="rsvp-email" className="rsvp-email-label">{t('rsvp.emailOptional')}</label>
              <div className="rsvp-email-row">
                <input
                  type="email"
                  id="rsvp-email"
                  className="rsvp-email-input"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  disabled={savingEmail}
                  placeholder={t('rsvp.emailPlaceholder')}
                />
                <button
                  type="button"
                  className="rsvp-email-save"
                  onClick={handleSaveEmail}
                  disabled={savingEmail || emailValue.trim() === (user.email || '')}
                >
                  {savingEmail ? '…' : t('rsvp.save')}
                </button>
              </div>
              {emailMessage && <p className="rsvp-email-message">{emailMessage}</p>}
            </section>

            <section className="rsvp-section rsvp-section-confirm">
              {user.presenceConfirmed ? (
                <div className="rsvp-confirmed-block">
                  <p className="rsvp-confirmed">{t('rsvp.confirmed')}</p>
                  <button
                    type="button"
                    className="rsvp-decline-button"
                    onClick={handleDeclinePresence}
                    disabled={declining}
                  >
                    {declineLabel}
                  </button>
                </div>
              ) : user.presenceDeclined ? (
                <div className="rsvp-declined-block">
                  <p className="rsvp-declined">{t('rsvp.declined')}</p>
                  <button
                    type="button"
                    className="rsvp-confirm-button"
                    onClick={handleConfirmPresence}
                    disabled={confirming}
                  >
                    {confirmLabel}
                  </button>
                </div>
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
            </section>

            <section className="rsvp-section rsvp-section-children">
              <h2 className="rsvp-children-title">{t('rsvp.children')}</h2>
              {user.children?.length > 0 && (
                <ul className="rsvp-children-list">
                  {user.children.map((c) => (
                    <li key={c.id} className="rsvp-child-item">
                      <span>
                        {c.name}
                        {c.age != null && (
                          <span className="rsvp-child-age"> ({t('rsvp.yearsOld').replace('{0}', c.age)})</span>
                        )}
                      </span>
                      <button
                        type="button"
                        className="rsvp-child-delete"
                        onClick={() => handleDeleteChild(c.id)}
                        disabled={deletingChildId !== null}
                        title={t('rsvp.deleteChild')}
                        aria-label={t('rsvp.deleteChild')}
                      >
                        {deletingChildId === c.id ? '…' : '×'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <form onSubmit={handleAddChild} className="rsvp-add-child">
                {childError && <p className="login-error rsvp-add-child-error" role="alert">{childError}</p>}
                <div className="rsvp-add-child-row">
                  <label htmlFor="rsvp-child-name" className="rsvp-add-child-label">{t('rsvp.childName')}</label>
                  <input
                    type="text"
                    id="rsvp-child-name"
                    className="rsvp-add-child-input"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    disabled={addingChild}
                  />
                  <label htmlFor="rsvp-child-age" className="rsvp-add-child-label">{t('rsvp.childAge')}</label>
                  <select
                    id="rsvp-child-age"
                    className="rsvp-child-age-select"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    disabled={addingChild}
                  >
                    <option value="">—</option>
                    {ageOptions.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button type="submit" className="rsvp-add-child-btn" disabled={addingChild || !childName.trim()}>
                    {t('rsvp.addChild')}
                  </button>
                </div>
              </form>
            </section>

            <section className="rsvp-section rsvp-section-transfer">
              <label className="rsvp-transfer-label">
                <input
                  type="checkbox"
                  className="rsvp-transfer-checkbox"
                  checked={user.transferNeed === true}
                  onChange={handleTransferNeedChange}
                  disabled={updatingTransfer}
                />
                <span className="rsvp-transfer-text">{t('rsvp.transferNeed')}</span>
              </label>
            </section>
          </div>
        ) : (
          <p className="rsvp-not-guest">{t('rsvp.notGuest')}</p>
        )}

        <footer className="rsvp-page-footer">
          <Link to="/" className="rsvp-back-link">{t('rsvp.backToInvitation')}</Link>
        </footer>
      </div>
    </main>
  );
}
