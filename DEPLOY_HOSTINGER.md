# Hostinger Deploy Notes

## Domain
- `namastebharat24.com`

## GitHub
- Repo: `https://github.com/Bipin1412/Namaste-Bharat`
- Branch: `master`

## Build Commands
- Install: `npm install`
- Build: `npm run build`
- Start: `npm start`

## Required Environment Variables
```env
FRONTEND_URL=https://namastebharat24.com
APP_JWT_SECRET=replace_with_strong_random_secret
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=u809236004_namastebharat
MYSQL_USER=u809236004_namasteapp
MYSQL_PASSWORD=Namastebharat24
MYSQL_CONNECTION_LIMIT=10
```

## Admin Login
- Email: `admin@namastebharat.local`
- Password: `Admin@123456`

## Database SQL Already Prepared
- Schema: `backend/sql/create_mysql_tables.sql`
- Data import: `backend/sql/import_mysql_data.sql`
- Admin login setup: `backend/sql/set_admin_login.sql`

## Notes
- The app builds successfully with `next build`.
- MySQL runtime connection should be configured on Hostinger itself.
- `127.0.0.1` / `localhost` is intended for the Hostinger server environment, not local Windows development.
