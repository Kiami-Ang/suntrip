import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { errMsg } from '../api';

export default function LoginPage() {
  const { login, isAdmin } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdmin) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      nav('/', { replace: true });
    } catch (err) {
      setError(errMsg(err, err.message || 'Não foi possível entrar'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        <h1>
          Sun<span style={{ color: 'var(--yellow)' }}>Trip</span> Admin
        </h1>
        <p>Painel de administração. Apenas contas com papel admin.</p>
        {error ? <div className="error-box">{error}</div> : null}
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gmail.com"
            required
            autoFocus
          />
        </div>
        <div className="field">
          <label>Palavra-passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            required
          />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
