import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { createGuest, getRoles } from '../api/client';

export default function Admin() {
  const { t } = useI18n();
  const [roles, setRoles] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    getRoles()
      .then((list) => {
        setRoles(list);
        if (list.length > 0) {
          setSelectedRoleName((prev) => {
            if (prev) return prev;
            const guest = list.find((r) => r.name === 'GUEST');
            return guest ? guest.name : list[0].name;
          });
        }
      })
      .catch(() => setRoles([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSubmitting(true);
    try {
      await createGuest({
        username: username.trim(),
        password,
        displayName: displayName.trim() || null,
        partnerName: partnerName.trim() || null,
        roles: selectedRoleName ? [selectedRoleName] : (roles.find((r) => r.name === 'GUEST') ? ['GUEST'] : roles.length ? [roles[0].name] : []),
      });
      setMessage({ type: 'success', text: t('admin.success') });
      setUsername('');
      setPassword('');
      setDisplayName('');
      setPartnerName('');
      setSelectedRoleName(roles.find((r) => r.name === 'GUEST')?.name || roles[0]?.name || '');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.status === 409 ? t('admin.error') : (err.message || t('admin.error')),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="invitation login-box">
      <h1>{t('admin.title')}</h1>
      <p className="intro">{t('admin.createGuest')}</p>
      {message.text && (
        <div className={message.type === 'success' ? 'login-success' : 'login-error'} role="alert">
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="admin-username">{t('admin.username')}</label>
        <input
          type="text"
          id="admin-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        <label htmlFor="admin-password">{t('admin.password')}</label>
        <input
          type="password"
          id="admin-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <label htmlFor="admin-displayName">{t('admin.displayName')}</label>
        <input
          type="text"
          id="admin-displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="name"
        />
        <label htmlFor="admin-partnerName">{t('admin.partnerName')}</label>
        <input
          type="text"
          id="admin-partnerName"
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
        />
        <label htmlFor="admin-role">{t('admin.roles')}</label>
        <select
          id="admin-role"
          className="admin-role-select"
          value={selectedRoleName}
          onChange={(e) => setSelectedRoleName(e.target.value)}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.name}>
              {t(`admin.role.${role.name}`)}
            </option>
          ))}
        </select>
        <button type="submit" disabled={submitting}>
          {t('admin.submit')}
        </button>
      </form>
      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/">{t('admin.backToInvitation')}</Link>
      </p>
    </main>
  );
}
