'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const featureList = [
  {
    icon: '🌸',
    title: 'Git Magic',
    desc: 'Every commit makes your Gotchi happy! Watch them dance with joy in real-time! ✨',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
  },
  {
    icon: '🎀',
    title: 'Build Sparkles',
    desc: 'Successful builds create rainbow sparkles! Your Gotchi celebrates with you! 🌈',
    gradient: 'from-purple-500 via-pink-500 to-red-500',
  },
  {
    icon: '🍓',
    title: 'Focus Time',
    desc: 'Stay focused and your Gotchi stays awake! Take breaks together! 💕',
    gradient: 'from-red-500 via-pink-500 to-rose-500',
  },
  {
    icon: '🦄',
    title: 'Team Fun',
    desc: 'Join a cute guild! Chat with friends! Compete on the weekly leaderboard! 🎉',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
  },
  {
    icon: '💝',
    title: 'AI Friend',
    desc: 'Get sweet, encouraging messages on every commit from your AI buddy! 🤗',
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
  },
  {
    icon: '🌙',
    title: 'Sleep Reminder',
    desc: 'Coding too late? Your Gotchi reminds you to rest! Sweet dreams! 😴',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
  },
];

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 0, -8],
    transition: { duration: 3, ease: 'easeInOut', repeat: Infinity },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Particle system
const Particles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default function HomePage(): JSX.Element {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const heroY = useTransform(smoothProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = (): void => {
    setIsLoggingIn(true);
    window.location.href = `${API_URL}/api/v1/auth/github`;
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <Particles />

      {/* Animated gradient background */}
      <motion.div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.3), transparent 50%)`,
        }}
      />

      {/* Animated mesh gradient */}
      <div className="fixed inset-0 z-0 opacity-20">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, #6366f1 0%, transparent 50%), radial-gradient(circle at 100% 100%, #8b5cf6 0%, transparent 50%)',
              'radial-gradient(circle at 100% 0%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 0% 100%, #6366f1 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, #6366f1 0%, transparent 50%), radial-gradient(circle at 100% 100%, #8b5cf6 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Floating emojis with parallax */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {[
          { emoji: '🌸', top: '10%', left: '5%', size: 'text-6xl', duration: 3 },
          { emoji: '💝', top: '20%', right: '10%', size: 'text-5xl', duration: 4 },
          { emoji: '🦄', bottom: '15%', left: '15%', size: 'text-7xl', duration: 3.5 },
          { emoji: '🎀', bottom: '25%', right: '8%', size: 'text-6xl', duration: 4.5 },
          { emoji: '✨', top: '50%', left: '50%', size: 'text-5xl', duration: 5 },
          { emoji: '🌈', top: '30%', left: '30%', size: 'text-4xl', duration: 3.8 },
          { emoji: '💫', top: '60%', right: '20%', size: 'text-5xl', duration: 4.2 },
        ].map((item, i) => (
          <motion.div
            key={i}
            className={`absolute ${item.size} opacity-20`}
            style={{ ...(item.top ? { top: item.top } : { bottom: item.bottom }), left: item.left, right: item.right }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-10, 10, -10],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </div>

      {/* Nav with glass morphism */}
      <motion.nav
        className="relative z-10 px-8 py-6 max-w-7xl mx-auto"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <div className="glass-card px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-opacity-40">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🐱✨
            </motion.span>
            <span className="font-display font-bold text-2xl text-gradient-cyan">
              CommitGotchi
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            <Link
              href="#features"
              className="text-sm font-semibold text-purple-400 hover:text-pink-400 transition-colors relative group"
            >
              Features 💕
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
            </Link>
            <motion.button
              id="login-btn"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="btn-neon flex items-center gap-2 relative overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(139, 92, 246, 0.6)' }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10 flex items-center gap-2">
                {isLoggingIn ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    ✨
                  </motion.span>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                )}
                Login with GitHub
              </span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero with parallax */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-24 flex flex-col items-center text-center">
        <motion.div
          ref={heroRef}
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="mb-6"
        >
          <motion.div
            variants={floatVariants}
            initial="initial"
            animate="animate"
            className="text-[140px] leading-none select-none relative"
            aria-label="CommitGotchi mascot"
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <motion.div
              className="absolute inset-0 blur-3xl opacity-50"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            🐱‍💻
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1
            className="font-display text-6xl md:text-8xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Your{' '}
            <motion.span
              className="text-gradient-cyan inline-block"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Code
            </motion.span>
            {' '}Deserves a{' '}
            <br />
            <motion.span
              className="text-gradient-amber inline-block"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Cute Companion!
            </motion.span>
            {' '}
            <motion.span
              className="inline-block"
              animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-xl font-medium text-purple-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            CommitGotchi is your adorable coding buddy that grows with every commit!
            Make coding fun, stay motivated, and watch your virtual pet evolve! 💝🌈
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="btn-neon text-lg px-10 py-5 flex items-center gap-3 relative overflow-hidden group"
              id="hero-login-btn"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600"
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: '100%', opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 flex items-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Start Free with GitHub! 🎀
              </span>
            </motion.button>

            <motion.a
              href="#features"
              className="text-purple-400 hover:text-pink-400 transition-colors flex items-center gap-2 group font-semibold"
              whileHover={{ x: 5 }}
            >
              See the magic ✨
              <motion.span
                className="group-hover:translate-x-1 transition-transform"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Stats bar with 3D effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl"
        >
          {[
            { label: 'XP per commit', value: '+10', color: 'text-pink-400', emoji: '💝', gradient: 'from-pink-500 to-rose-500' },
            { label: 'Build success', value: '+15', color: 'text-green-400', emoji: '🌸', gradient: 'from-green-500 to-emerald-500' },
            { label: 'Focus reward', value: '+20', color: 'text-yellow-400', emoji: '✨', gradient: 'from-yellow-500 to-amber-500' },
            { label: 'Rest time', value: '6hr', color: 'text-purple-400', emoji: '🌙', gradient: 'from-purple-500 to-indigo-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass-card p-6 text-center relative overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              whileHover={{
                scale: 1.1,
                rotateY: 10,
                boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)',
                zIndex: 10,
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
              />
              <motion.div
                className="text-4xl mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              >
                {stat.emoji}
              </motion.div>
              <motion.div
                className={`font-display text-3xl font-bold ${stat.color}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.1, type: 'spring', stiffness: 200 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs text-purple-400 mt-2 font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features grid with advanced animations */}
      <section
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-8 py-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.h2
            className="font-display text-5xl font-bold mb-4 text-gradient-cyan"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            Everything You Need! 🌈
          </motion.h2>
          <motion.p
            className="text-lg font-medium text-purple-400 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Super fast, super cute, and made with love! Your Gotchi reacts instantly! 💝✨
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featureList.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="glass-card p-8 relative overflow-hidden group cursor-pointer"
              whileHover={{
                scale: 1.05,
                rotateX: 5,
                rotateY: 5,
                boxShadow: '0 25px 50px rgba(139, 92, 246, 0.5)',
              }}
              style={{ transformStyle: 'preserve-3d' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* Animated gradient background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20`}
                initial={{ scale: 0, rotate: 0 }}
                whileHover={{ scale: 1.5, rotate: 180 }}
                transition={{ duration: 0.6 }}
              />

              {/* Sparkle effect */}
              <motion.div
                className="absolute top-2 right-2 text-2xl"
                animate={{
                  scale: [1, 1.5, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              >
                ✨
              </motion.div>

              <motion.div
                className="text-6xl mb-4 relative z-10"
                whileHover={{
                  scale: 1.2,
                  rotate: [0, -10, 10, -10, 0],
                  y: [-5, 0, -5],
                }}
                transition={{ duration: 0.5 }}
              >
                {feature.icon}
              </motion.div>

              <h3 className="font-display font-bold text-xl mb-3 text-gradient-cyan relative z-10">
                {feature.title}
              </h3>

              <p className="text-purple-400 text-sm leading-relaxed font-medium relative z-10">
                {feature.desc}
              </p>

              {/* Hover border effect */}
              <motion.div
                className="absolute inset-0 border-2 border-transparent group-hover:border-purple-500 rounded-lg"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA footer with magnetic effect */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 relative overflow-hidden group"
          whileHover={{ boxShadow: '0 30px 60px rgba(139, 92, 246, 0.6)' }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, #6366f1 0%, transparent 50%)',
                'radial-gradient(circle at 100% 100%, #8b5cf6 0%, transparent 50%)',
                'radial-gradient(circle at 0% 100%, #ec4899 0%, transparent 50%)',
                'radial-gradient(circle at 100% 0%, #6366f1 0%, transparent 50%)',
                'radial-gradient(circle at 0% 0%, #6366f1 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          {/* Floating emojis */}
          {[
            { emoji: '✨', delay: 0, top: '10%', right: '10%' },
            { emoji: '💝', delay: 0.5, bottom: '10%', left: '10%' },
            { emoji: '🌸', delay: 1, top: '10%', left: '10%' },
            { emoji: '🎀', delay: 1.5, bottom: '10%', right: '10%' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-30"
              style={{ ...(item.top ? { top: item.top } : { bottom: item.bottom }), left: item.left, right: item.right }}
              animate={{
                y: [-10, 10, -10],
                rotate: [-15, 15, -15],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: item.delay,
              }}
            >
              {item.emoji}
            </motion.div>
          ))}

          <motion.div
            className="text-7xl mb-6 relative z-10"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🐱💕
          </motion.div>

          <motion.h2
            className="font-display text-5xl font-bold mb-4 text-gradient-cyan relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Your Gotchi is Waiting! 🎀
          </motion.h2>

          <motion.p
            className="text-lg font-medium text-purple-400 mb-8 max-w-md mx-auto relative z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Connect GitHub and watch your adorable companion come to life! Let's make coding fun together! 🌈✨
          </motion.p>

          <motion.button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="btn-neon text-xl px-12 py-5 relative z-10 overflow-hidden group"
            id="cta-login-btn"
            whileHover={{
              scale: 1.1,
              boxShadow: '0 0 50px rgba(139, 92, 246, 1)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <span className="relative z-10">Begin Your Adventure! 🚀💝</span>
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="relative z-10 text-center py-8 px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.p
          className="text-sm font-medium text-purple-300"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Made with 💝 by developers who love cute things! ✨
        </motion.p>
      </motion.footer>
    </main>
  );
}
