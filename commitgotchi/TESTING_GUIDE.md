# 🧪 Тестування системи автоматичної зміни Gotchi

## Швидкий старт

### 1. Запуск backend

```bash
cd backend
npm install
npm run start:dev
```

Backend запуститься на `http://localhost:3001`

### 2. Запуск frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend запуститься на `http://localhost:3000`

### 3. Налаштування GitHub Webhook

1. Перейди в свій GitHub репозиторій
2. Settings → Webhooks → Add webhook
3. Payload URL: `https://your-domain.com/api/v1/webhooks/github`
4. Content type: `application/json`
5. Secret: (твій `GITHUB_WEBHOOK_SECRET` з `.env`)
6. Events: `push`, `workflow_run`

## Приклади тестування

### Тест 1: Python commit

```bash
# Створи Python файл
echo "print('Hello from Python')" > test.py

git add test.py
git commit -m "Add Python script"
git push
```

**Очікуваний результат:**
- Gotchi змінить тему на `Python`
- Колір частинок стане синьо-жовтим (#3776ab, #ffd43b)
- Анімації стануть плавнішими (0.8x швидкість)
- Святкування буде елегантним

### Тест 2: C++ commit

```bash
# Створи C++ файл
echo "#include <iostream>\nint main() { return 0; }" > main.cpp

git add main.cpp
git commit -m "Add C++ code"
git push
```

**Очікуваний результат:**
- Gotchi змінить тему на `C++`
- Колір частинок стане синім (#00599C)
- Анімації стануть швидшими (1.5x швидкість)
- Святкування буде потужним

### Тест 3: JavaScript commit

```bash
# Створи JS файл
echo "console.log('Hello from JS');" > app.js

git add app.js
git commit -m "Add JavaScript code"
git push
```

**Очікуваний результат:**
- Gotchi змінить тему на `JS`
- Колір частинок стане жовтим (#f7df1e)
- Анімації стануть енергійними (1.3x швидкість)
- Святкування буде динамічним

### Тест 4: Мікс мов (домінує TypeScript)

```bash
# Створи кілька файлів
echo "const x: number = 5;" > app.ts
echo "const y: string = 'test';" > utils.ts
echo "print('test')" > script.py

git add .
git commit -m "Add mixed language files"
git push
```

**Очікуваний результат:**
- Gotchi змінить тему на `TypeScript` (2 файли .ts vs 1 файл .py)
- Колір частинок стане синім (#3178c6)

## Перевірка логів

### Backend logs

```bash
cd backend
npm run start:dev
```

Шукай в логах:
```
[GithubService] Detected language: Python (3/5 files)
[GithubService] Updated Gotchi theme to Python for user username
```

### Frontend console

Відкрий DevTools (F12) → Console

Шукай:
```
[Socket] Theme changed: { newTheme: 'Python', language: 'Python', message: '🎨 Your Gotchi transformed into Python mode!' }
```

## Перевірка бази даних

```bash
cd backend
npm run prisma:studio
```

Відкрий таблицю `gotchis` і перевір поле `theme` - воно має змінитися після push.

## Debugging

### Якщо тема не змінюється:

1. **Перевір webhook:**
```bash
# В логах backend має бути:
[GithubWebhookController] Received GitHub event: push
```

2. **Перевір файли в коміті:**
```bash
# Backend логує всі файли:
[LanguageDetectorService] Detected language: Python (2/3 files)
```

3. **Перевір WebSocket з'єднання:**
```javascript
// В браузері console:
socket.connected // має бути true
```

4. **Перевір що користувач існує:**
```bash
# Backend логує:
[GithubService] No user found for GitHub username: xxx
```

### Якщо анімації не змінюються:

1. Перевір що `theme` передається в `GotchiModel3D`:
```typescript
<GotchiModel3D theme={gotchi?.theme ?? 'JS'} />
```

2. Перевір console на помилки Three.js

3. Перевір що `LanguageAnimations.tsx` імпортується правильно

## Структура файлів

```
backend/
├── src/
│   └── github/
│       ├── language-detector.service.ts  ← Визначення мови
│       ├── github.service.ts             ← Оновлення теми
│       └── github-webhook.controller.ts  ← Webhook endpoint

frontend/
├── src/
│   ├── config/
│   │   └── languageModels.ts            ← Конфігурація мов
│   ├── components/
│   │   └── GotchiRoom/
│   │       ├── LanguageAnimations.tsx   ← Анімації для мов
│   │       ├── GotchiModel3D.tsx        ← 3D модель
│   │       └── GotchiRoom.tsx           ← Головний компонент
│   ├── hooks/
│   │   └── useSocket.ts                 ← WebSocket слухач
│   └── types/
│       └── index.ts                     ← TypeScript типи
```

## Додавання нової мови

### 1. Backend (language-detector.service.ts)

```typescript
'.dart': 'Dart',
```

### 2. Frontend (languageModels.ts)

```typescript
'Dart': {
  theme: 'Dart',
  modelUrl: '/models/dart-gotchi.vrm',
  primaryColor: '#0175C2',
  secondaryColor: '#13B9FD',
  accentColor: '#54C5F8',
  particleColor: '#0175C2',
  description: 'Flutter Dart developer',
  personality: 'Fast, modern, cross-platform',
},
```

### 3. Frontend (LanguageAnimations.tsx)

```typescript
'Dart': {
  idleSpeed: 1.2,
  typingIntensity: 1.4,
  celebrationStyle: 'energetic',
  breathingRate: 1.5,
  headMovementRange: 0.13,
},
```

### 4. Frontend (types/index.ts)

```typescript
export type GotchiTheme = '...' | 'Dart';
```

## Корисні команди

```bash
# Перезапустити backend
cd backend && npm run start:dev

# Перезапустити frontend
cd frontend && npm run dev

# Очистити базу даних
cd backend && npm run prisma:migrate reset

# Переглянути базу даних
cd backend && npm run prisma:studio

# Перевірити TypeScript помилки
cd frontend && npm run type-check

# Перевірити ESLint
cd backend && npm run lint
cd frontend && npm run lint
```

## Відомі проблеми

### 1. VRM модель не завантажується
**Рішення:** Поки що всі мови використовують `/models/default-gotchi.vrm`. Додай власні VRM моделі в `public/models/`.

### 2. WebSocket не підключається
**Рішення:** Перевір що backend запущений і `NEXT_PUBLIC_WS_URL` правильний в `.env.local`.

### 3. Тема не оновлюється в реальному часі
**Рішення:** Перезавантаж сторінку після push - тема має оновитися при наступному завантаженні.

## Успіх! 🎉

Якщо все працює, ти побачиш:
1. ✅ Push на GitHub
2. ✅ Backend логує визначену мову
3. ✅ WebSocket відправляє `theme_changed` event
4. ✅ Frontend оновлює Gotchi тему
5. ✅ Анімації та кольори змінюються
6. ✅ Частинки та освітлення оновлюються

Насолоджуйся своїм динамічним Gotchi! 🚀
