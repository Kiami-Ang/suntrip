'use client';

import AppShell from './AppShell';

export default function AppLayout({ children, title, hideTitle }) {
  return <AppShell title={hideTitle ? null : title}>{children}</AppShell>;
}
