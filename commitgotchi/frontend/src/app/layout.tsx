import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CommitGotchi — Mindful Developer Companion',
  description:
    'A quiet space where your commits nurture a digital companion. Focus sessions, guild collaboration, and gentle AI mentorship.',
  keywords: ['developer productivity', 'gamification', 'github', 'pomodoro', 'gotchi'],
  authors: [{ name: 'CommitGotchi Team' }],
  openGraph: {
    title: 'CommitGotchi',
    description: 'A mindful coding companion that grows with your commits.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#16161a',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
