'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const featureList = [
  {
    kanji: '筆',
    title: 'Git Integration',
    desc: 'Every commit nurtures your companion. Watch them respond in real-time.',
  },
  {
    kanji: '灯',
    title: 'Build Awareness',
    desc: 'Successful builds bring warmth. Your companion celebrates quietly with you.',
  },
  {
    kanji: '静',
    title: 'Focus Sessions',
    desc: 'Stay present and your companion stays alert. Rest together when needed.',
  },
  {
    kanji: '結',
    title: 'Guild System',
    desc: 'Join a guild. Collaborate with peers. Grow on the weekly leaderboard.',
  },
  {
    kanji: '知',
    title: 'AI Mentorship',
    desc: 'Receive thoughtful, encouraging feedback on every commit.',
  },
  {
    kanji: '眠',
    title: 'Wellness Guard',
    desc: 'Coding too long? Your companion reminds you to rest.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Dust motes — warm floating particles
const DustMotes = () => {
  const motes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 25 + 15,
    delay: Math.random() * 8,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {motes.map((m) => (
        <motion.div
          key={m.id}
          className="absolute rounded-full"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
            backgroundColor: 'rgba(212, 168, 67, 0.25)',
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: m.duration,
            repeat: Infinity,
            delay: m.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default function HomePage(): JSX.Element {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const heroY = useTransform(smoothProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);

  const handleLogin = (): void => {
    setIsLoggingIn(true);
    window.location.href = `${API_URL}/api/v1/auth/github`;
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <DustMotes />

      {/* Subtle seigaiha pattern on background */}
      <div className="fixed inset-0 z-0 pattern-seigaiha opacity-40" />

      {/* Nav */}
      <motion.nav
        className="relative z-10 px-8 py-6 max-w-7xl mx-auto"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="washi-card px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-semibold text-2xl text-gradient-ink">
              CommitGotchi
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="#features"
              className="text-sm font-medium text-sumi-300 hover:text-fuji transition-colors relative group"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-fuji group-hover:w-full transition-all duration-300" />
            </Link>
            <motion.button
              id="login-btn"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="btn-ink flex items-center gap-2"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoggingIn ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-4 h-4 border-2 border-sumi-900 border-t-transparent rounded-full"
                />
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              )}
              Login with GitHub
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-28 flex flex-col items-center text-center">
        <motion.div
          ref={heroRef}
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.h1
            className="font-display text-5xl md:text-7xl font-semibold mb-6 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          >
            Your{' '}
            <span className="text-gradient-ink">Code</span>
            {' '}Deserves a
            <br />
            <span className="text-gradient-warm">Quiet Companion</span>
          </motion.h1>

          <motion.p
            className="text-lg text-sumi-300 max-w-xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            CommitGotchi is a mindful coding companion that grows with every commit.
            Stay focused, code with intention, and nurture your practice.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="btn-ink text-base px-10 py-4 flex items-center gap-3"
              id="hero-login-btn"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Start Free with GitHub
            </motion.button>

            <motion.a
              href="#features"
              className="text-sumi-300 hover:text-fuji transition-colors flex items-center gap-2 font-medium text-sm"
              whileHover={{ x: 3 }}
            >
              Learn more
              <span className="transition-transform">
                &rarr;
              </span>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl"
        >
          {[
            { label: 'XP per commit', value: '+10', color: 'text-fuji' },
            { label: 'Build success', value: '+15', color: 'text-wakatake' },
            { label: 'Focus reward', value: '+20', color: 'text-yamabuki' },
            { label: 'Rest threshold', value: '6hr', color: 'text-hanada' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="washi-card p-5 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.08, duration: 0.4 }}
            >
              <div className={`font-display text-2xl font-semibold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-sumi-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-8 py-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl font-semibold mb-3 text-gradient-ink">
            Everything You Need
          </h2>
          <p className="text-base text-sumi-300 max-w-md mx-auto">
            Simple tools for mindful development. Your companion responds instantly.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {featureList.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="washi-card p-7 group"
            >
              <div className="text-3xl mb-4 text-fuji/60 font-serif select-none">
                {feature.kanji}
              </div>

              <h3 className="font-display font-semibold text-lg mb-2 text-sumi-50">
                {feature.title}
              </h3>

              <p className="text-sumi-300 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="washi-card p-12"
        >
          <h2 className="font-display text-4xl font-semibold mb-3 text-gradient-ink">
            Your Companion Awaits
          </h2>

          <p className="text-base text-sumi-300 mb-8 max-w-md mx-auto">
            Connect GitHub and watch your companion come to life.
          </p>

          <motion.button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="btn-ink text-base px-10 py-4"
            id="cta-login-btn"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            Begin
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 px-8">
        <p className="text-sm text-sumi-500">
          Built with care.
        </p>
      </footer>
    </main>
  );
}
