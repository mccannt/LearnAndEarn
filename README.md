# Learn & Earn

Learn & Earn is a tablet-friendly educational app for kids with a parent-managed dashboard, curriculum-aligned question banks, avatar rewards, and time-based reward controls. It is built with Next.js, TypeScript, Prisma, and SQLite.

## Current Scope

### Learner experience
- Grade-aware math practice with New Brunswick curriculum alignment for Grades 1 through 7
- English practice with curriculum-aligned reading, vocabulary, grammar, and sentence work
- Session scoring with difficulty and response-time weighting
- Avatar customization and unlockable catalog items
- Reward redemption flow tied to parent-managed catalog rules
- Modernized learner dashboards for math, English, avatar, rewards, and progress

### Parent experience
- Password-protected parent dashboard
- Child management with age and grade-level support
- Curriculum-aware math and English content management
- Reward catalog management and redemption history
- Avatar catalog management
- Session limit and learning setting controls

## Curriculum Alignment

The current question bank is aligned to official New Brunswick curriculum sources:

- Math Grades 1 to 7
- English Language Arts bands K to 3 and 4 to 6

Question delivery is grade-aware for learners and grade-filterable for parents. Seeded curriculum metadata includes grade bands, curriculum codes, outcomes, and source URLs so authored content and fallback content stay aligned.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui
- Prisma ORM
- SQLite

## Quick Start

```bash
npm install
npx prisma db push
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Core Scripts

```bash
npm run dev
npm run build
npm run start
npm run test
npx tsc --noEmit --pretty false --incremental false
npx eslint src
npx prisma db push
npm run seed
```

## Data Model Highlights

- `Child` stores learner profile, avatar equipment, points, and grade level
- `MathQuestion` and `EnglishQuestion` store curriculum metadata and seed keys
- `AvatarItemCatalog` stores unlockable avatar items
- `RewardCatalog` stores redeemable reward inventory
- `LearningSession` and `Progress` track learner performance over time

## Development Notes

- Prisma migrations are tracked in `prisma/migrations/`
- Seed data lives in `prisma/seed.ts`, `prisma/catalog-data.ts`, and the curriculum question bank helpers
- Curriculum templates and fallback banks live under `src/lib/`
- API routes are in `src/app/api/`
- Parent authoring and catalog management surfaces live under `src/app/parent/`

## Verification

The current stabilization flow has been validated with:

```bash
npx prisma db push --accept-data-loss
npm run seed
npm test
npx tsc --noEmit --pretty false --incremental false
npx eslint src/app/math/page.tsx src/app/parent/content/content-manager.tsx src/lib/curriculum.ts src/lib/curriculum-question-bank.ts src/lib/question-management.ts src/lib/grade-level.ts test/curriculum-routing.test.ts test/question-management.test.ts
npm run build
```

## Additional Docs

- [Quick Start Guide](QUICK_START.md)
- [Packaging Guide](PACKAGING_GUIDE.md)
- [Proxmox Setup](PROXMOX_SETUP.md)
- [LXC Deployment](LXC_DEPLOYMENT_COMPLETE.md)
- [GitHub Setup](GITHUB_SETUP.md)

## Default Local Parent Credentials

- Email: `parent@example.com`
- Password: `parent123`

These are seeded for local development only.
