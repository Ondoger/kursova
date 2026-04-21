# 🎨 Автоматична зміна Gotchi за мовою програмування

## Як це працює

Коли ти робиш push на GitHub, система автоматично:

1. **Аналізує файли** в коміті (added, modified, removed)
2. **Визначає мову програмування** за розширеннями файлів
3. **Змінює тему Gotchi** відповідно до виявленої мови
4. **Застосовує унікальні анімації** для кожної мови

## Підтримувані мови

### C++ 🚀
- **Колір**: Синій (#00599C)
- **Особливості**: Швидкі, енергійні рухи
- **Стиль святкування**: Потужний (powerful)
- **Швидкість анімації**: 1.5x
- **Розширення**: `.cpp`, `.cc`, `.cxx`, `.hpp`, `.h`

### Java ☕
- **Колір**: Помаранчевий (#f89820)
- **Особливості**: Структуровані, надійні рухи
- **Стиль святкування**: Спокійний (calm)
- **Швидкість анімації**: 1.0x
- **Розширення**: `.java`

### Python 🐍
- **Колір**: Синьо-жовтий (#3776ab, #ffd43b)
- **Особливості**: Плавні, елегантні рухи
- **Стиль святкування**: Елегантний (elegant)
- **Швидкість анімації**: 0.8x
- **Розширення**: `.py`, `.pyw`, `.pyx`

### JavaScript ⚡
- **Колір**: Жовтий (#f7df1e)
- **Особливості**: Динамічні, швидкі рухи
- **Стиль святкування**: Енергійний (energetic)
- **Швидкість анімації**: 1.3x
- **Розширення**: `.js`, `.jsx`, `.mjs`

### TypeScript 📘
- **Колір**: Синій (#3178c6)
- **Особливості**: Точні, типізовані рухи
- **Стиль святкування**: Спокійний (calm)
- **Швидкість анімації**: 1.1x
- **Розширення**: `.ts`, `.tsx`

### Rust 🦀
- **Колір**: Червоно-помаранчевий (#ce422b)
- **Особливості**: Безпечні, швидкі рухи
- **Стиль святкування**: Потужний (powerful)
- **Швидкість анімації**: 1.2x
- **Розширення**: `.rs`

### Go 🐹
- **Колір**: Блакитний (#00add8)
- **Особливості**: Конкурентні, ефективні рухи
- **Стиль святкування**: Енергійний (energetic)
- **Швидкість анімації**: 1.4x
- **Розширення**: `.go`

### C# 💜
- **Колір**: Фіолетовий (#68217a)
- **Особливості**: Сучасні, універсальні рухи
- **Стиль святкування**: Спокійний (calm)
- **Швидкість анімації**: 1.0x
- **Розширення**: `.cs`

### Ruby 💎
- **Колір**: Червоний (#cc342d)
- **Особливості**: Виразні, елегантні рухи
- **Стиль святкування**: Елегантний (elegant)
- **Швидкість анімації**: 0.9x
- **Розширення**: `.rb`

### PHP 🐘
- **Колір**: Фіолетово-синій (#777bb4)
- **Особливості**: Веб-орієнтовані рухи
- **Стиль святкування**: Спокійний (calm)
- **Швидкість анімації**: 1.0x
- **Розширення**: `.php`

### Swift 🍎
- **Колір**: Помаранчево-червоний (#f05138)
- **Особливості**: Сучасні, безпечні рухи
- **Стиль святкування**: Енергійний (energetic)
- **Швидкість анімації**: 1.3x
- **Розширення**: `.swift`

### Kotlin 🎯
- **Колір**: Фіолетовий (#7f52ff)
- **Особливості**: Лаконічні, безпечні рухи
- **Стиль святкування**: Спокійний (calm)
- **Швидкість анімації**: 1.1x
- **Розширення**: `.kt`, `.kts`

## Унікальні анімації

Кожна мова має свої особливості:

### Стилі святкування (при CI success / level up):

- **Powerful** (C++, Rust): Високі стрибки, сильні пози
- **Energetic** (JS, Go, Swift): Енергійне махання руками
- **Elegant** (Python, Ruby): Витончені, грациозні рухи
- **Calm** (Java, TypeScript, C#, PHP, Kotlin): Спокійне святкування

### Параметри анімації:

- **idleSpeed**: Швидкість базової анімації
- **typingIntensity**: Інтенсивність рухів при друкуванні
- **breathingRate**: Швидкість дихання
- **headMovementRange**: Діапазон руху голови

## Візуальні ефекти

Кожна мова має унікальні кольори для:

- 🌟 **Частинок** (sparkles)
- 💡 **Освітлення** (accent lights)
- ⭕ **Магічних кілець** (floating rings)
- ✨ **Підсвічування персонажа**

## Приклад використання

```typescript
// Frontend
<GotchiRoom
  animationState="typing"
  lighting="normal"
  mood={80}
  energy={90}
  gotchiName="MyGotchi"
  modelUrl="/models/default-gotchi.vrm"
  theme="Python"  // 👈 Автоматично змінюється при push
  showConfetti={false}
/>
```

## Backend логіка

```typescript
// Автоматичне визначення мови
const allFiles = [...commit.added, ...commit.modified];
const detectedLanguage = languageDetector.detectLanguage(allFiles);
const newTheme = languageDetector.mapLanguageToTheme(detectedLanguage);

// Оновлення Gotchi
await gotchiService.updateGotchi(userId, { theme: newTheme });

// Повідомлення користувача
await eventsGateway.emitToUser(userId, 'theme_changed', {
  newTheme,
  language: detectedLanguage,
  message: `🎨 Your Gotchi transformed into ${detectedLanguage} mode!`,
});
```

## WebSocket події

### `theme_changed`
Відправляється коли змінюється тема Gotchi:

```typescript
{
  newTheme: 'Python',
  language: 'Python',
  message: '🎨 Your Gotchi transformed into Python mode!'
}
```

## Додавання нових мов

1. Додай розширення в `language-detector.service.ts`:
```typescript
'.newext': 'NewLanguage',
```

2. Додай конфігурацію в `languageModels.ts`:
```typescript
'NewLanguage': {
  theme: 'NewLanguage',
  modelUrl: '/models/new-gotchi.vrm',
  primaryColor: '#hexcolor',
  // ...
}
```

3. Додай анімації в `LanguageAnimations.tsx`:
```typescript
'NewLanguage': {
  idleSpeed: 1.0,
  typingIntensity: 1.2,
  celebrationStyle: 'energetic',
  // ...
}
```

4. Оновити тип в `types/index.ts`:
```typescript
export type GotchiTheme = '...' | 'NewLanguage';
```

## Тестування

Зроби commit з файлами різних мов і подивись як змінюється Gotchi:

```bash
# Python commit
git add script.py
git commit -m "Add Python script"
git push

# C++ commit
git add main.cpp
git commit -m "Add C++ code"
git push

# JavaScript commit
git add app.js
git commit -m "Add JS code"
git push
```

Твій Gotchi буде автоматично трансформуватися! 🎉
