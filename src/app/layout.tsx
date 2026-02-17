import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: {
    default: 'X Clone',
    template: '%s | X Clone',
  },
  description:
    'A Twitter/X clone built with Next.js - Share your thoughts with the world',
  keywords: [
    'Twitter',
    'X',
    'Social Media',
    'Microblogging',
    'Next.js',
    'React',
  ],
  authors: [{ name: 'X Clone Team' }],
  generator: 'Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN" className="dark">
      <body className={`antialiased`}>
        <LanguageProvider>
          <UserProvider>
            {isDev && <Inspector />}
            {children}
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
