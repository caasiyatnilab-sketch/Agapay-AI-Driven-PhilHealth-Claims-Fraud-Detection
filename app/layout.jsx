import './globals.css';
import AuthProvider from '../components/AuthProvider';
import ToastProvider from '../components/ToastProvider';

export const metadata = {
  title: 'Agapay: PhilHealth Claims System',
  description: 'AI-Powered Blockchain PhilHealth Claims & Fraud Detection System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
