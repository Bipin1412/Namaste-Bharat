# Namaste Bharat — Deployment Guide (Hostinger)
# READ THIS FULLY BEFORE STARTING

---

## What Was Fixed (already in this code)

| Fix | File |
|-----|------|
| External images (400 errors) now whitelisted | `next.config.ts` |
| Business listing creation now requires login | `backend/routes/listing.routes.js` |
| Weak JWT secret fallback removed | `backend/config/env.js` |
| **50-entry cap fixed** — MySQL is now single source of truth; JSON file no longer caps listings | `lib/backend/service.ts` |
| `data/db.json` excluded from git — redeploy no longer wipes customer entries | `.gitignore` |

---

## CRITICAL — The 50-Entry Limit (Read This First)

**Why it was happening:**
The app stores listings in two places: MySQL database AND a local JSON file (`data/db.json`).
When MySQL was not working (wrong credentials, wrong host), ALL customer entries were saved only to `data/db.json`.
That file was tracked in git with exactly 50 entries. Every time the developer did `git pull` on the server, the file reset back to those 50 — wiping every new entry customers had added.

**What was fixed in this release:**
1. `data/db.json` is now excluded from git — `git pull` will never overwrite it again
2. When MySQL is connected, it is now the ONLY data source — the JSON file is only used as a last-resort fallback if MySQL goes completely offline

**Before deploying — migrate the 50 existing entries to MySQL:**

The 50 businesses currently in `data/db.json` on the server need to be imported into MySQL so they are not lost. Run this on the server after Step 6 (database setup):

```bash
node scripts/migrate-json-to-mysql.js
```

See Step 6b below for full migration instructions.

---

## Step 1 — Set Up Environment Variables on Hostinger

1. Log in to **Hostinger hPanel**
2. Go to **Websites → your site → Node.js**
3. Find the **Environment Variables** section
4. Add EVERY variable listed below (copy from `.env.production` in this repo):

```
NEXT_PUBLIC_BACKEND_URL=https://namastebharat24.com
FRONTEND_URL=https://namastebharat24.com
BACKEND_PORT=4000
APP_JWT_SECRET=<generate using command below>
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=u809236004_namastebharat
MYSQL_USER=u809236004_namasteapp
MYSQL_PASSWORD=<your actual MySQL password from hPanel>
MYSQL_CONNECTION_LIMIT=10
```

### Generate APP_JWT_SECRET
Run this command once on any machine and copy the output:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Paste the result as the value for `APP_JWT_SECRET`. Keep it secret. Never change it after launch.

---

## Step 2 — Create .env.local on the Server

After setting env vars in hPanel, also create a `.env.local` file in the project root on the server.
Copy `.env.production` from this repo, rename it to `.env.local`, and fill in the real values.

```bash
cp .env.production .env.local
nano .env.local    # edit and fill in real values
```

---

## Step 3 — Upload / Pull the Code

### Option A: Via Git (recommended)
```bash
cd /home/u809236004/domains/namastebharat24.com/public_html
git pull origin master
```

### Option B: Via File Manager
Upload the entire project folder (excluding `node_modules/` and `.next/`) to the server.

---

## Step 4 — Install Dependencies

```bash
npm install --production=false
```

> `--production=false` ensures dev dependencies (TypeScript, etc.) needed for the build are installed.

---

## Step 5 — Build the App

```bash
npm run build
```

This creates the `.next/` folder with all compiled JS chunks.
**This step is MANDATORY. Skipping it is what caused the "Failed to load resource 404" errors.**

Expected output at the end:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
```

If the build fails, check the error — it will tell you exactly what is wrong.

---

## Step 6 — Set Up the Database

Run these SQL files in order in Hostinger's **phpMyAdmin** (hPanel → Databases → phpMyAdmin):

1. `backend/sql/create_mysql_tables.sql` — creates all tables
2. `backend/sql/import_mysql_data.sql` — seeds initial data
3. `backend/sql/set_admin_login.sql` — creates admin account

Admin login after setup:
- **Email:** `admin@namastebharat.local`
- **Password:** `Admin@123456`

> Change the admin password immediately after first login.

---

## Step 6b — Migrate Existing 50 Entries to MySQL (IMPORTANT — do this once)

The 50 customer entries currently stored in `data/db.json` on the server must be moved to MySQL **before** going live, otherwise they will be invisible after this deployment.

```bash
node scripts/migrate-json-to-mysql.js
```

Expected output:
```
Found 50 businesses in db.json. Migrating to MySQL...
  ✓ Business Name 1
  ✓ Business Name 2
  ...
Migration complete.
  Inserted: 50
  Skipped:  0
```

After the migration succeeds, those 50 entries live in MySQL permanently and will never be wiped by a redeploy again.

---

## Step 7 — Start the App

In Hostinger hPanel → Node.js, set:

| Field | Value |
|-------|-------|
| Node.js version | 20.x (LTS) |
| Application mode | Production |
| Entry point / Startup file | `node_modules/.bin/next` |
| Arguments | `start` |

Or if using SSH:
```bash
npm start
# which runs: next start
```

> **IMPORTANT:** The startup command must be `next start` — NOT `node backend/server.js` and NOT `node app.js`.

---

## Step 8 — Start the Backend (Express API)

The Express backend runs separately on port 4000. Start it with PM2 (process manager):

```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start the backend
pm2 start backend/server.js --name namastebharat-backend

# Make it restart automatically on server reboot
pm2 save
pm2 startup
```

Verify it's running:
```bash
curl http://localhost:4000/api/health
# Expected: {"ok":true,"service":"namastebharat-express-backend"}
```

---

## Step 9 — Verify the Deployment

Open browser DevTools (F12 → Console tab) after deploying. You should see:
- ✅ No more `/_next/static/chunks/*.js 404` errors
- ✅ No more `image 400` errors
- ✅ Site loads fully

---

## Troubleshooting

### Still seeing chunk 404 errors?
- You forgot to run `npm run build` — run it again
- Check that `next start` is the startup command, not `node server.js`

### Images still showing 400 errors?
- Ensure `npm run build` was re-run after the `next.config.ts` fix
- Check that image URLs in the database are valid HTTPS URLs

### Backend API calls failing?
- Confirm PM2 is running: `pm2 list`
- Check backend logs: `pm2 logs namastebharat-backend`
- Check `.env.local` has correct MySQL credentials

### Build fails with TypeScript errors?
- Run `npm install --production=false` first
- Share the error output

---

## File Checklist Before Deploying

- [ ] `.env.local` created on server with real values
- [ ] `APP_JWT_SECRET` set to a long random string
- [ ] `MYSQL_PASSWORD` set to actual Hostinger DB password
- [ ] `npm install` completed without errors
- [ ] `npm run build` completed without errors
- [ ] Database SQL files imported in phpMyAdmin
- [ ] PM2 running `backend/server.js`
- [ ] `next start` set as the app entry point

---

## Summary of Changed Files in This Release

| File | Change |
|------|--------|
| `next.config.ts` | Added `images.remotePatterns` — fixes image 400 errors |
| `backend/routes/listing.routes.js` | Added `requireAuth` to `POST /businesses` — security fix |
| `backend/config/env.js` | Removed insecure JWT secret default |
| `lib/backend/service.ts` | MySQL is now single source of truth — JSON file only used as offline fallback |
| `.gitignore` | `data/db.json` excluded — redeploy can never wipe customer entries again |
| `scripts/migrate-json-to-mysql.js` | NEW — one-time script to move 50 existing entries into MySQL |
| `.env.production` | New template file for production environment setup |
