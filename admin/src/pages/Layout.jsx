import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../auth';

const LINKS = [
  { to: '/', end: true, label: 'Dashboard' },
  { to: '/users', label: 'Utilizadores' },
  { to: '/vouchers', label: 'Vouchers' },
  { to: '/transactions', label: 'Transacções' },
  { to: '/audit', label: 'Auditoria' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          Sun<span>Trip</span>
        </div>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {l.label}
          </NavLink>
        ))}
        <div className="sidebar-foot">
          <div className="email">{user?.email}</div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Sair
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
