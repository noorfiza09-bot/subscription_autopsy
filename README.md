# Subscription Autopsy

Upload a bank/card statement CSV, and it finds every recurring charge —
subscriptions you signed up for and forgot about — along with the total
monthly damage and any price hikes.

## Stack

- **Next.js 14 (App Router) + TypeScript** — frontend and API routes in one app
- **PostgreSQL + Prisma** — data layer
- **Tailwind CSS** — styling (ledger/receipt visual theme)
- **papaparse** — CSV parsing
- **NextAuth** — auth (not wired up yet, see below)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up a free Postgres database (Neon)

You don't need Postgres installed locally — Neon gives you a free hosted
instance in about a minute.

1. Go to [neon.tech](https://neon.tech) and sign up (GitHub login is fastest).
2. Click **Create a project**. Name it whatever you like (e.g.
   `subscription-autopsy`), pick a region close to you, leave Postgres
   version at the default.
3. Once the project is created, you'll land on a dashboard with a
   **Connection string** box. Click to reveal it — it looks like:
   ```
   postgresql://neondb_owner:AbC123xyz@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Copy that whole string.

(Supabase works the same way if you'd rather use that — Project Settings →
Database → Connection string → URI, just make sure you use the "Session
pooler" or direct connection string, not the pgbouncer transaction-mode one,
since Prisma migrations need a direct connection.)

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and replace the `DATABASE_URL` value with the connection string
you copied from Neon:

```
DATABASE_URL="postgresql://neondb_owner:AbC123xyz@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

Leave `NEXTAUTH_SECRET` and `NEXTAUTH_URL` as-is for now — they're only
needed once you wire up real auth (see Suggested build order, step 3).

### 4. Create the database tables

This reads `prisma/schema.prisma` and creates the actual tables in your
Neon database:

```bash
npx prisma migrate dev --name init
```

You should see output ending in something like `Your database is now in
sync with your schema.` If it fails, the most common cause is a copy-paste
error in `DATABASE_URL` — check for a stray space or missing `?sslmode=require`.

### 5. Seed a test user

Auth isn't wired up yet, so the API currently just acts as whichever user
comes first in the database. `prisma/seed.ts` creates one for you:

```bash
npx prisma db seed
```

This creates a user `test@example.com` / `password123` and prints its id.
You can re-run this safely — it upserts, so it won't create duplicates.

Want to double check it worked? Run `npx prisma studio` — it opens a
browser GUI at `localhost:5555` where you can see the `User` table directly
and browse any data the app creates later.

### 6. Generate a real NEXTAUTH_SECRET

The placeholder in `.env.example` isn't a real secret — generate one:

```bash
openssl rand -base64 32
```

Paste the output into `.env` as `NEXTAUTH_SECRET`. (No `openssl`? Any random
32+ character string works for local dev — just don't use it in production.)

### 7. Run the dev server

```bash
npm run dev
```

Go to `http://localhost:3000` — you'll see sign-in/sign-up links instead of
the upload form until you log in. Create an account, or use the seeded test
account (`test@example.com` / `password123`) if you ran `npx prisma db seed`.

### Quick troubleshooting

| Problem | Likely fix |
|---|---|
| `Can't reach database server` | Check `DATABASE_URL` was pasted correctly, including `?sslmode=require` |
| `relation "User" does not exist` | You skipped step 4 — run `npx prisma migrate dev` |
| Upload succeeds but dashboard is empty | Check your CSV's column names against `src/lib/parseStatement.ts`'s expected headers — see step 1 of the build order below |
| `No user found — seed a user first` | Run `npx prisma db seed` |

## Where the interesting code lives

- `src/lib/detectSubscriptions.ts` — the core algorithm. Groups transactions
  by merchant, checks for a consistent interval (weekly/monthly/yearly) and
  consistent amount, flags price hikes. **This is the part worth spending
  real time on** — the rest of the app is fairly standard CRUD.
- `src/lib/normalizeMerchant.ts` — cleans up messy bank descriptions
  ("NETFLIX.COM 8014561234 CA" → "netflix") so the same merchant groups
  together. You'll likely need to tune this against your own bank's real
  export format — every bank formats descriptions differently.
- `src/lib/parseStatement.ts` — CSV column-header guessing and date parsing.
  Explicitly parses DD/MM/YYYY (not the ambiguous native JS Date parser,
  which assumes US MM/DD/YYYY) — also bank-specific, test against a real
  statement export early.
- `src/lib/auth.ts` — NextAuth credentials provider (email + bcrypt-hashed
  password). All API routes check `getServerSession` and scope data to
  `session.user.id`; `middleware.ts` protects `/dashboard` at the route level.

## Suggested build order (few-week plan)

1. **Get a real CSV working end to end.** Export an actual statement from
   your bank, and adjust `parseStatement.ts`'s column-name guesses until
   real transactions parse correctly. Do this before anything else —
   everything downstream depends on clean data.
2. **Stress-test the detection algorithm** with edge cases: a subscription
   that changed price, one that was cancelled and re-subscribed, one-off
   purchases from the same merchant (e.g. buying something from Amazon
   twice isn't a subscription) that shouldn't be falsely flagged.
3. ~~Wire up real auth~~ — done. Email/password via NextAuth, sessions
   scope all data per-user.
4. **Polish the dashboard**: category tags, a spend-over-time chart with
   `recharts`, better empty/error states.
5. **Stretch goals**: multi-statement history merging (already partially
   supported — detection re-runs across all of a user's transactions on
   every upload), PDF statement support, email reminders before renewal.

## Deploying to Vercel

Your Neon database is already cloud-hosted, so deployment is just pushing
the app itself somewhere that can run Next.js. Vercel is the natural fit
(same company that builds Next.js, generous free tier).

1. **Push your project to GitHub** if it isn't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
   Create a new repo on GitHub, then follow its "push an existing repo"
   instructions.

2. **Import the project on Vercel.** Go to
   [vercel.com/new](https://vercel.com/new), sign in with GitHub, and
   select your repo. Vercel auto-detects Next.js — you don't need to
   change any build settings.

3. **Add environment variables.** Before deploying (or right after, then
   redeploy), go to the project's Settings → Environment Variables and add:
   - `DATABASE_URL` — same Neon connection string from your local `.env`
   - `NEXTAUTH_SECRET` — generate a **new, different** one for production
     with `openssl rand -base64 32`; don't reuse your local dev secret
   - `NEXTAUTH_URL` — your Vercel deployment URL once you have it, e.g.
     `https://subscription-autopsy.vercel.app` (you can add this after the
     first deploy gives you the URL, then redeploy)

4. **Run the migration against production.** Your Neon database already
   has the schema from local development (same `DATABASE_URL`), so nothing
   extra is needed — Neon isn't a separate prod/dev database unless you
   explicitly create a second project. If you'd rather keep local and
   production data separate, create a second Neon project for production
   and set that connection string in Vercel's env vars instead, then run
   `npx prisma migrate deploy` locally with that URL temporarily set.

5. **Deploy.** Vercel builds and deploys automatically on push after the
   first setup. Check the deployment logs if anything fails — a missing
   env var is the most common cause.

6. **Seed a production user (optional).** The seed script only ran
   locally. If you want the test account to exist in production too, run
   `DATABASE_URL="<your prod url>" npx prisma db seed` locally — or just
   sign up for a real account through the deployed `/signup` page, which
   is the normal path anyway.

## Known limitations to fix as you go

- CSV column detection is heuristic and will need tuning per bank.
- The detection algorithm needs at least 2 occurrences of a merchant to
  flag it, so a brand-new subscription won't show up until its second charge.
- No password reset flow yet — if you forget a test account's password,
  just sign up with a new email or delete the row in `prisma studio`.
- `suggestCategory.ts` only auto-tags on first detection of a merchant;
  once you manually override a category it's never auto-changed again, but
  the keyword list is short — add your own merchants as you find gaps.
- Price hike tracking (`previousAmount`) only captures the most recent
  jump. If a subscription's price changes twice between uploads, only the
  latest change is visible — good enough for now, but worth knowing.

## After pulling these changes

The Subscription model gained two things: a `previousAmount` field (price
hike tracking) and category auto-suggestion on creation. You'll need to
run a migration to pick up the schema change:

```bash
npx prisma migrate dev --name add_price_hike_tracking
```

Then re-upload your CSV — newly detected subscriptions will get an
auto-suggested category, and if you re-upload data that includes a price
change (like the sample statement's Netflix hike), you'll see a red
"▲ went up from ₹X" badge on that card.
