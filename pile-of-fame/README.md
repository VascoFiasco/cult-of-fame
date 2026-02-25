# Pile of Fame

The Strava for miniature painting. Transform your pile of shame into public momentum.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Set up your database:
```bash
# If using a local PostgreSQL
npm run db:push

# Or run migrations
npm run db:migrate
```

4. Generate Prisma client:
```bash
npm run db:generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Auth routes (login, register)
│   ├── (app)/        # Main app routes (feed, ritual, profile)
│   └── api/          # API routes
├── features/         # Feature-based modules
│   ├── ritual/       # Session tracking
│   ├── feed/         # Event feed
│   ├── cult/         # Cults (Phase 1.5)
│   └── crusade/      # Crusades (Phase 1.5)
├── components/       # Shared components
│   └── ui/           # shadcn/ui components
├── lib/              # Core utilities
├── hooks/            # Custom React hooks
└── types/            # TypeScript types
```

## Core Loop

1. **Confession** → User declares their pile size
2. **Ritual** → User logs a painting session
3. **Event** → Session becomes an event in the feed
4. **Reactions** → Other users react (Pray, Purify, Exalt)
5. **Streak** → Consistent sessions build streaks
6. **Identity** → Users become consistent painters

## Development Order

1. Auth (NextAuth setup)
2. Confession flow
3. Ritual timer + event creation
4. Feed (event-based)
5. Reactions
6. Streak calculation
7. openClaw system messages
8. Cults (Phase 1.5)
9. Crusades (Phase 1.5)

## License

MIT
