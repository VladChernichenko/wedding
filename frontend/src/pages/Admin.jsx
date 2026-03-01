import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { createGuest, getRoles, getUsers } from '../api/client';

export default function Admin() {
  const { t } = useI18n();
  const formRef = useRef(null);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [email, setEmail] = useState('');
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
    getUsers().then(setUsers).catch(() => setUsers([]));
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
        email: email.trim() || null,
        roles: selectedRoleName ? [selectedRoleName] : (roles.find((r) => r.name === 'GUEST') ? ['GUEST'] : roles.length ? [roles[0].name] : []),
      });
      setMessage({ type: 'success', text: t('admin.success') });
      setUsername('');
      setPassword('');
      setDisplayName('');
      setPartnerName('');
      setEmail('');
      setSelectedRoleName(roles.find((r) => r.name === 'GUEST')?.name || roles[0]?.name || '');
      getUsers().then(setUsers).catch(() => {});
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.status === 409 ? t('admin.error') : (err.message || t('admin.error')),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToAddUser = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="invitation login-box">
      <h1>{t('admin.title')}</h1>

      <section className="admin-users-section" style={{ marginTop: '1rem' }}>
        <div className="admin-users-header">
          <h2>{t('admin.usersList')}</h2>
          <button type="button" className="admin-add-user-btn" onClick={scrollToAddUser}>
            {t('admin.addUser')}
          </button>
        </div>
        {users.length === 0 ? (
          <p className="admin-users-empty">{t('admin.usersEmpty')}</p>
        ) : (
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>{t('admin.tableUser')}</th>
                <th>{t('admin.tablePartner')}</th>
                <th>{t('admin.tableRoles')}</th>
                <th>{t('admin.tableConfirmed')}</th>
                <th>{t('admin.tableTransfer')}</th>
                <th>{t('admin.tableChildren')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.username}>
                  <td>{u.displayName || u.username}</td>
                  <td>{u.partnerName || '—'}</td>
                  <td>
                    <span className="admin-user-badges">
                      {u.roles?.map((r) => (
                        <span key={r} className="admin-user-role">{t(`admin.role.${r}`)}</span>
                      ))}
                    </span>
                  </td>
                  <td>{u.presenceConfirmed ? t('admin.presenceConfirmed') : u.presenceDeclined ? t('admin.presenceDeclined') : '—'}</td>
                  <td>{u.transferNeed ? t('admin.yes') : '—'}</td>
                  <td>{u.children?.length ? u.children.map((c) => c.age != null ? `${c.name} (${c.age})` : c.name).join(', ') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div ref={formRef}>
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
        <label htmlFor="admin-email">{t('admin.email')}</label>
        <input
          type="email"
          id="admin-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
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
      </div>

      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/">{t('admin.backToInvitation')}</Link>
      </p>
    </main>
  );
}
