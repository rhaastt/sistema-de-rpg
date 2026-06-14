import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Celestia RPG',
  description: 'Gerenciador de campanhas e fichas do RPG Celestia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
