import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'SunTrip — Pagamentos de Transporte',
  description: 'Fintech angolana para pagamentos digitais em táxis e transporte urbano',
};

export const viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
