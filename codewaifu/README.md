# CodeWaifu  GitHub-гейміфікація 

> Курсова робота. Інтерактивний веб-застосунок, який перетворює твою активність на GitHub
> на 3D-персонажа в аніме-стилі. Чим більше коммітиш  тим крутіший вайфу.

![tech](https://img.shields.io/badge/React-19-61dafb) ![vite](https://img.shields.io/badge/Vite-8-646cff) ![ts](https://img.shields.io/badge/TypeScript-5-3178c6) ![three](https://img.shields.io/badge/Three.js-r180-000) ![tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

##  Опис проєкту

**CodeWaifu**  це SPA (single-page application), що демонструє можливості сучасного фронтенду:
React, TypeScript, Three.js і Tailwind CSS. Користувач вводить свій GitHub-нік (без OAuth,
лише публічні дані), а застосунок:

1. Витягує статистику через **GitHub REST API v3**
2. Розраховує **XP / Level (1100)** на основі коммітів, стріку, репозиторіїв, зірок
3. Малює живого **3D-персонажа** (повністю процедурно з примітивів Three.js  без зовнішніх 3D-моделей)
4. Розблоковує **16 ачівментів** залежно від активності
5. Анімує реакції персонажа: idle, victory, level-up, working, sad

###  Геймплей

| Тір | Рівень | Опис |
|-----|--------|------|
|  **Новачок** | 110 | Базовий стрій, спокійна анімація |
|  **Учень** | 1130 | Світіння волосся + слабкі частинки |
|  **Майстер** | 3160 | Сяюча аура, активні частинки |
|  **Легенда** | 61100 | Крила + німб + драматичні ефекти |

---

##  Технологічний стек

| Шар | Технологія |
|-----|------------|
| Frontend | **React 19 + TypeScript + Vite** |
| 3D | **Three.js + @react-three/fiber + @react-three/drei** |
| Post-processing | **@react-three/postprocessing** (UnrealBloomPass) |
| Анімації | **Framer Motion** + GSAP |
| Стилі | **Tailwind CSS 3** + кастомні CSS-анімації + glassmorphism |
| Графіки | **Recharts** (donut, area-chart) |
| State | **Zustand** з persist-middleware |
| Routing | **React Router 7** |
| API | **GitHub REST API v3** (без бекенду) |

---

##  Швидкий старт

```bash
# Встановити залежності
npm install

# Запустити dev-сервер (http://localhost:5173)
npm run dev

# Збірка для продакшену
npm run build

# Перегляд продакшен-збірки
npm run preview
```

###  Конфігурація токена (опціонально)

GitHub API має ліміт **60 запитів/годину** для неавторизованих запитів. Якщо ти впираєшся
в ліміт  введи свій *Personal Access Token* (PAT) у формі на лендінгу.
Токен використовується **тільки в браузері** і ніколи не йде на бекенд.

Створити токен:
[github.com/settings/tokens](https://github.com/settings/tokens) (достатньо `public_repo` scope або
взагалі без скоупів  ми читаємо лише публічні дані).

---

##  Архітектура проєкту

```
src/
 components/
    Character/          # 3D-персонаж + RPG-статистика
       Character3D.tsx
       CharacterStats.tsx
    Dashboard/
       StatsCards.tsx     # Картки статистики з анімацією counter
       CommitHeatmap.tsx  # GitHub-style heatmap з неоновим glow
       LanguageChart.tsx  # Donut-chart по мовам
       ActivityGraph.tsx  # Area-chart активності за рік
       Leaderboard.tsx    # Топ-користувачі GitHub
       TopRepos.tsx       # Топ-5 репозиторіїв
    Achievements/
       AchievementCard.tsx
    UI/
        GlassCard.tsx          # Glassmorphism-картка
        NeonButton.tsx         # Кнопка з вибухом частинок при hover
        ParticleBackground.tsx # 1600 частинок у Three.js
        FloatingCode.tsx       # Плаваючі сніпети коду на фоні
        AnimatedNumber.tsx     # Лічильник з easing
        Navbar.tsx
 pages/
    Landing.tsx             # /        Підключення GitHub
    Dashboard.tsx           # /dashboard Стати + персонаж
    Character.tsx           # /character Повноекранний 3D-перегляд
    Achievements.tsx        # /achievements Зал слави
 hooks/
    useGitHub.ts           # Авто-завантаження статистики
    useCharacterLevel.ts   # XP, рівні, ачівменти, тригери настрою
 store/
    useStore.ts            # Zustand-store з persist
 utils/
    github.ts              # API-клієнт + кешування в localStorage
    gamification.ts        # XP/Level/Tier/RPG-формули
    achievements.ts        # 16 ачівментів з прогрес-логікою
 three/
    character.tsx          # Процедурний персонаж
 types/
     index.ts               # GitHubUser/Repo/Stats/Achievement
```

---

##  Формули гейміфікації

```typescript
XP = totalCommits  10
   + currentStreak  50
   + totalRepos  100
   + totalStars  25
   + languagesCount  75
   + followers  5
   + prsMerged  60

Level = floor(sqrt(XP / 100)) + 1   // capped at 100
```

###  Ачівменти (16 шт.)

- **First Blood**  перший комміт
- **Century**  100 коммітів
- **Millennium**  1000 коммітів (legendary)
- **On Fire**  стрік 7 днів
- **Unstoppable**  стрік 30 днів (epic)
- **Polyglot**  5+ мов
- **Language Master**  одна мова >60%
- **Open Source Hero**  5+ репо
- **Star Collector**  10+ зірок
- **Supernova**  100+ зірок (epic)
- **Night Owl**  комміти 00:0004:00 (epic)
- **Early Bird**  комміти 05:0008:00
- **Pull Master**  10+ змерджених PR
- **Social Coder**  50+ фолловерів
- **Fork Lord**  10+ форків
- **Veteran**  5+ років на GitHub

###  RPG-характеристики

| Стат | Розрахунок |
|------|------------|
| **STR** (Strength) | частота коммітів |
| **INT** (Intelligence) | кількість мов |
| **AGI** (Agility) | швидкість PR |
| **END** (Endurance) | стрік |
| **LUK** (Luck) | зірки + фолловери |
| **CHA** (Charisma) | фолловери + форки |

---

##  3D-персонаж

Персонаж побудований **повністю процедурно** з примітивів `three.js`
(сфери, конуси, капсули, тороїди, октаедри)  без зовнішніх GLTF-моделей.

**Анімації:**
- Idle: дихання, плавання волосся, морг очей, легке покачування корпусу
- Victory: руки вгору + glow-pulse
- Level Up: спін + стрибок + сяюча сфера зверху
- Working: швидкі рухи рук (типінг)
- Sad: голова опускається, руки опущені

**Візуальні ефекти:**
- `UnrealBloomPass` для свічення емісивних матеріалів
- `@react-three/drei` Environment "night" для PBR-освітлення
- 220 частинок навколо персонажа (для тірів 2+)
- Аура (BackSide-сфера + AdditiveBlending) для тірів 3+
- Крила + німб для легендарного тіру

---

##  Візуальний дизайн

- **Тема:** dark (`#05050a` / `#0a0a0f`)
- **Акценти:** `#00ffff` cyan, `#ff00ff` pink, `#7c3aed` purple, `#fbbf24` gold
- **Шрифти:** **Orbitron** (заголовки), **Inter** (текст)
- **Glassmorphism:** `backdrop-filter: blur(24px)` + градієнтні рамки через `mask-composite`
- **Неонові тіні:** `box-shadow: 0 0 20px ...` + `text-shadow`
- **Page transitions:** Framer Motion `AnimatePresence` з `mode="wait"`
- **Кешування:** localStorage TTL 1 год (зменшує навантаження на API)

---

##  Сторінки

### `/`  Landing
Лендінг із 3D-персонажем праворуч, формою введення `username` ліворуч,
плаваючими сніпетами коду на фоні та 1600 частинками у Three.js-полі.

### `/dashboard`  Dashboard
**Лівий блок (30%):** 3D-персонаж + level/XP-bar + швидкий перегляд ачівментів.
**Правий блок (70%):** 6 stats-карток, heatmap-контриб'юшенів за 26 тижнів,
area-chart активності за рік, donut-chart мов, топ-5 репо, світовий лідерборд.

### `/character`  Character
Повноекранний viewer з `OrbitControls` (можна обертати/зумити),
RPG-статистика, skill tree з мов, опис тірів, кнопки трига емоцій.

### `/achievements`  Achievements
Зал слави з фільтрами по rarity, прогрес-баром, картками з progress-bar
для кожного ачівмента.

---

##  Що далі (TODO)

- [ ] Інтеграція з GraphQL API GitHub для точного `totalCommits`
- [ ] OAuth-flow (Vercel/Netlify-функція)
- [ ] Експорт картки персонажа як PNG
- [ ] Multiplayer-режим: дуелі з іншими розробниками
- [ ] Sound-effects на левел-апи

---

##  Ліцензія

MIT  курсова робота, користуйся вільно.

---

**Зроблено з кавою та сегфолтами.** 
