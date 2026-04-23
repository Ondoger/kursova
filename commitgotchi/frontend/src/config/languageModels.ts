import type { GotchiTheme } from '@/types';

// ---- Language-specific model configurations ----

export interface LanguageModelConfig {
  theme: GotchiTheme;
  modelUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  particleColor: string;
  description: string;
  personality: string;
}

export const LANGUAGE_MODELS: Record<GotchiTheme, LanguageModelConfig> = {
  'C++': {
    theme: 'C++',
    modelUrl: '/models/cpp-gotchi.vrm',
    primaryColor: '#00599C',
    secondaryColor: '#004482',
    accentColor: '#659AD2',
    particleColor: '#00599C',
    description: 'Fast and powerful C++ warrior',
    personality: 'Energetic, precise, performance-focused',
  },

  'Java': {
    theme: 'Java',
    modelUrl: '/models/java-gotchi.vrm',
    primaryColor: '#f89820',
    secondaryColor: '#5382a1',
    accentColor: '#e76f00',
    particleColor: '#f89820',
    description: 'Enterprise-ready Java professional',
    personality: 'Reliable, structured, object-oriented',
  },

  'Python': {
    theme: 'Python',
    modelUrl: '/models/python-gotchi.vrm',
    primaryColor: '#3776ab',
    secondaryColor: '#ffd43b',
    accentColor: '#306998',
    particleColor: '#ffd43b',
    description: 'Elegant and versatile Python sage',
    personality: 'Friendly, readable, zen-like',
  },

  'JS': {
    theme: 'JS',
    modelUrl: '/models/js-gotchi.vrm',
    primaryColor: '#f7df1e',
    secondaryColor: '#323330',
    accentColor: '#f0db4f',
    particleColor: '#f7df1e',
    description: 'Dynamic JavaScript innovator',
    personality: 'Flexible, async, event-driven',
  },

  'TypeScript': {
    theme: 'TypeScript',
    modelUrl: '/models/ts-gotchi.vrm',
    primaryColor: '#3178c6',
    secondaryColor: '#235a97',
    accentColor: '#5599ff',
    particleColor: '#3178c6',
    description: 'Type-safe TypeScript architect',
    personality: 'Precise, scalable, strongly-typed',
  },

  'Rust': {
    theme: 'Rust',
    modelUrl: '/models/rust-gotchi.vrm',
    primaryColor: '#ce422b',
    secondaryColor: '#a72b1c',
    accentColor: '#f74c00',
    particleColor: '#ce422b',
    description: 'Memory-safe Rust guardian',
    personality: 'Safe, concurrent, blazingly fast',
  },

  'Go': {
    theme: 'Go',
    modelUrl: '/models/go-gotchi.vrm',
    primaryColor: '#00add8',
    secondaryColor: '#007d9c',
    accentColor: '#5dc9e2',
    particleColor: '#00add8',
    description: 'Concurrent Go gopher',
    personality: 'Simple, efficient, concurrent',
  },

  'C#': {
    theme: 'C#',
    modelUrl: '/models/csharp-gotchi.vrm',
    primaryColor: '#239120',
    secondaryColor: '#68217a',
    accentColor: '#a179dc',
    particleColor: '#68217a',
    description: 'Modern C# developer',
    personality: 'Versatile, modern, cross-platform',
  },

  'Ruby': {
    theme: 'Ruby',
    modelUrl: '/models/ruby-gotchi.vrm',
    primaryColor: '#cc342d',
    secondaryColor: '#9b2423',
    accentColor: '#e8554e',
    particleColor: '#cc342d',
    description: 'Elegant Ruby craftsperson',
    personality: 'Expressive, elegant, developer-friendly',
  },

  'PHP': {
    theme: 'PHP',
    modelUrl: '/models/php-gotchi.vrm',
    primaryColor: '#777bb4',
    secondaryColor: '#4f5b93',
    accentColor: '#8892bf',
    particleColor: '#777bb4',
    description: 'Web-focused PHP builder',
    personality: 'Practical, web-native, flexible',
  },

  'Swift': {
    theme: 'Swift',
    modelUrl: '/models/swift-gotchi.vrm',
    primaryColor: '#f05138',
    secondaryColor: '#e84a2f',
    accentColor: '#ff6b4a',
    particleColor: '#f05138',
    description: 'Swift iOS creator',
    personality: 'Modern, safe, Apple-native',
  },

  'Kotlin': {
    theme: 'Kotlin',
    modelUrl: '/models/kotlin-gotchi.vrm',
    primaryColor: '#7f52ff',
    secondaryColor: '#5e3cc0',
    accentColor: '#a97bff',
    particleColor: '#7f52ff',
    description: 'Pragmatic Kotlin developer',
    personality: 'Concise, safe, interoperable',
  },
};

// Fallback to default model if VRM not available
export function getModelUrl(theme: GotchiTheme): string {
  const config = LANGUAGE_MODELS[theme];
  // For now, use a default VRM model for all languages
  // You can replace these with actual language-specific models later
  return '/models/default-gotchi.vrm';
}

export function getLanguageConfig(theme: GotchiTheme): LanguageModelConfig {
  return LANGUAGE_MODELS[theme] || LANGUAGE_MODELS['JS'];
}
