# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CommitGotchi is a gamified developer productivity SaaS platform that combines a virtual pet companion with real-time GitHub integration, Pomodoro timers, guild systems, and AI-powered code mentorship. The application rewards developers with XP for commits, tracks CI/CD build status, and encourages healthy coding habits through wellness features.

## Architecture

This is a monorepo with two main workspaces:

- **frontend**: Next.js 14 app with React 18, TypeScript, Tailwind CSS, and Three.js for 3D Gotchi rendering
- **backend**: NestJS API with WebSocket gateway, Prisma ORM, SQLite database, and OpenAI integration

### Key Technologies

- **Frontend**: Next.js (App Router), React Three Fiber, Zustand (state), Socket.IO client, Framer Motion
- **Backend**: NestJS, Prisma, Socket.IO, Passport (GitHub OAuth), JWT auth, OpenAI API
- **Database**: SQLite (via Prisma) - note that the schema uses SQLite-compatible syntax
- **Real-time**: Socket.IO for bidirectional WebSocket communication

## Development Commands

### Root-level commands (from project root)

```bash
# Install all dependencies
npm run install:all

# Run frontend dev server (http://localhost:3000)
npm run dev:frontend

# Run backend dev server (http://localhost:3001)
npm run dev:backend

# Build frontend for production
npm run build:frontend

# Build backend for production
npm run build:backend

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### Frontend-specific (from frontend/ directory)

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Backend-specific (from backend/ directory)

```bash
npm run start:dev    # Start NestJS in watch mode
npm run start:debug  # Start with debugger
npm run build        # Build for production
npm run start:prod   # Run production build
npm run lint         # Run ESLint with auto-fix
npm run test         # Run Jest tests
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio GUI
```

## Project Structure

### Backend Architecture

The backend follows NestJS modular architecture with these core modules:

- **auth**: GitHub OAuth2 authentication, JWT strategy, auth guards
- **github**: Webhook controller and service for handling push/workflow_run events
- **gotchi**: Gotchi entity management (mood, energy, theme, outfits)
- **guild**: Guild system for team collaboration and leaderboards
- **events**: WebSocket gateway handling real-time events (Socket.IO)
- **ai-mentor**: OpenAI integration for commit feedback
- **pomodoro**: Wellness service with focus tracking and overwork prevention
- **prisma**: Database service wrapper

### Frontend Architecture

- **app/**: Next.js App Router pages (page.tsx, layout.tsx, dashboard/)
- **components/**: React components organized by feature
  - GotchiRoom/: 3D rendering with React Three Fiber
  - Pomodoro/: Timer UI and focus tracking
  - GuildChat/: Real-time chat interface
  - XPBar/: Progress visualization
  - Modals/: Dashboard modal dialogs
- **lib/**: Utility modules (api.ts for HTTP, socket.ts for WebSocket)
- **hooks/**: Custom React hooks (useSocket.ts)
- **types/**: TypeScript type definitions

### Real-time Communication Flow

1. Frontend connects to WebSocket gateway with JWT cookie
2. Gateway authenticates and joins user to personal room (`user_${userId}`)
3. If user has guild, auto-joins guild room (`guild_${guildId}`)
4. Backend services emit events via `EventsGateway.emitToUser()` or `emitToGuild()`
5. Frontend listens via Socket.IO client and updates UI reactively

### Database Schema (Prisma)

Key models:
- **User**: GitHub auth, XP, level, streak, guild membership
- **Gotchi**: Virtual companion (mood, energy, theme, outfit)
- **Guild**: Team entity with total XP and mascot level
- **ActivityLog**: Event history (commits, pomodoros, focus loss)
- **InventoryItem** / **UserInventory**: Cosmetic items and ownership

Note: Uses SQLite, so avoid PostgreSQL-specific SQL syntax (use `LEAST()` instead of `GREATEST()`, handle JSON as strings).

## Environment Setup

### Backend (.env)

Copy `backend/.env.example` to `backend/.env` and configure:
- `DATABASE_URL`: SQLite file path or PostgreSQL connection string
- `REDIS_URL`: Redis connection (optional, for caching)
- `JWT_SECRET`: Min 32 characters for token signing
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: OAuth app credentials
- `GITHUB_WEBHOOK_SECRET`: For webhook signature verification
- `OPENAI_API_KEY`: For AI mentor feature

### Frontend (.env.local)

Copy `frontend/.env.local.example` to `frontend/.env.local`:
- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: http://localhost:3001)
- `NEXT_PUBLIC_WS_URL`: WebSocket URL (default: http://localhost:3001)
- `NEXTAUTH_URL`: Frontend URL for NextAuth
- `NEXTAUTH_SECRET`: Min 32 characters

## Key Features & Implementation Notes

### GitHub Webhook Integration

- Endpoint: `POST /api/v1/webhooks/github`
- Verifies HMAC signature using `GITHUB_WEBHOOK_SECRET`
- Handles `push` events (awards XP per commit) and `workflow_run` events (CI/CD status)
- Emits real-time events to connected users via WebSocket

### XP & Leveling System

- Commits: +10 XP per commit
- CI success: +15 XP bonus
- Pomodoro completion: +20 XP
- Level calculation: Based on total XP accumulation
- Streak tracking: Consecutive days with commits

### Wellness Guard

- Tracks coding hours via activity logs
- Blocks XP gain if user codes >6 hours without breaks
- Sets `xpBlockedUntil` timestamp on User model
- Emits `force_sleep` event to frontend

### Pomodoro Timer

- WebSocket-based timer with server-side interval
- Emits `timer_tick` every second with remaining time
- Tracks focus loss via `focus_lost` event (deducts Gotchi energy)
- Rewards completion with XP and restores Gotchi mood/energy

### 3D Gotchi Rendering

- Uses React Three Fiber and @pixiv/three-vrm for VRM model loading
- Gotchi mood/energy affects animations and expressions
- Theme determines visual appearance (JS, Python, Rust, Go, TypeScript)

## API Structure

All backend routes are prefixed with `/api/v1` (configured in `main.ts`).

Example endpoints:
- `GET /api/v1/auth/github` - Initiate GitHub OAuth
- `GET /api/v1/auth/github/callback` - OAuth callback
- `POST /api/v1/webhooks/github` - GitHub webhook receiver
- `GET /api/v1/gotchi/me` - Get current user's Gotchi
- `PATCH /api/v1/gotchi/me` - Update Gotchi properties

## WebSocket Events

### Client → Server
- `join_guild`: Join a guild room
- `guild_message`: Send chat message to guild
- `start_pomodoro`: Start focus timer
- `stop_pomodoro`: Cancel active timer
- `focus_lost`: Report tab visibility loss

### Server → Client
- `xp_update`: XP gained notification
- `level_up`: Level increase celebration
- `ci_success` / `ci_failure`: Build status
- `force_sleep`: Wellness guard triggered
- `timer_tick`: Pomodoro countdown
- `pomodoro_complete`: Timer finished
- `guild_message`: Chat message broadcast
- `focus_lost_ack`: Focus loss acknowledged

## Testing & Debugging

- Backend logs are verbose in development (see `main.ts` logger config)
- Use `npm run prisma:studio` to inspect database visually
- WebSocket connections require valid JWT in cookie or auth header
- GitHub webhooks can be tested with ngrok or webhook.site for local dev

## Common Patterns

### Adding a new backend module

1. Generate with NestJS CLI: `nest g module feature-name`
2. Create service: `nest g service feature-name`
3. Create controller if needed: `nest g controller feature-name`
4. Import module in `app.module.ts`
5. Inject `PrismaService` for database access
6. Inject `EventsGateway` to emit WebSocket events

### Adding a new WebSocket event

1. Add event handler in `events.gateway.ts` with `@SubscribeMessage('event_name')`
2. Define payload interface at top of file
3. Add event to `ServerEvents` interface for type safety
4. Emit from services using `eventsGateway.emitToUser(userId, 'event_name', data)`

### Frontend API calls

Use `apiFetch()` from `lib/api.ts` - automatically includes credentials and handles errors:

```typescript
const data = await apiFetch<ResponseType>('/endpoint', { method: 'POST', body: JSON.stringify(payload) });
```

### Frontend WebSocket usage

Use `useSocket()` hook from `hooks/useSocket.ts` for automatic connection management and event listeners.
