import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CommitGotchi — Gamified Developer Productivity',
  description:
    'Level up your coding with CommitGotchi: a gamified SaaS where your commits power a virtual anime companion. CI tracking, Pomodoro focus sessions, and guild co-op.',
  keywords: ['developer productivity', 'gamification', 'github', 'pomodoro', 'gotchi'],
  authors: [{ name: 'CommitGotchi Team' }],
  openGraph: {
    title: 'CommitGotchi',
    description: 'Your wholesome coding companion that grows with your commits!',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFF5F7',
  colorScheme: 'light',
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
