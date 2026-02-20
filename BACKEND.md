# Namaste Bharat Backend API

Frontend Next API (local): `http://localhost:3000/api`
Express Backend (local): `http://localhost:4000/api`

## Health
- `GET /health`

## Home Snapshot
- `GET /home`

Returns featured businesses, active offers, categories, and quick filters for home screen rendering.

## Businesses
- `GET /businesses`
- `GET /businesses/:id`
- `POST /businesses`
- `PATCH /businesses/:id`
- `DELETE /businesses/:id`

New listing lifecycle:
- New submissions are saved as `listingStatus = pending`.
- Pending listings are not shown in public business APIs.
- Admin activates listing to move it to `listingStatus = active`.

### Query params for `GET /businesses`
- `q`: full-text search across name/category/locality/city
- `q` now also searches keywords, services, description, service areas, highlights, and FAQ text for detailed listings
- `category`: exact category filter (case-insensitive)
- `city`: exact city filter (case-insensitive)
- `verified`: `true|false`
- `openNow`: `true|false`
- `sort`: `rating_desc|rating_asc|reviews_desc|newest`
- `page`: default `1`
- `limit`: default `12`, max `50`

### Detailed fields accepted in `POST /businesses` and `PATCH /businesses/:id`
- Optional profile fields:
  - `tagline`, `description`, `ownerName`, `establishedYear`
  - `addressLine1`, `addressLine2`, `pincode`, `email`, `website`
- Optional arrays:
  - `keywords`, `serviceAreas`, `languages`, `highlights`
- Optional structured fields:
  - `services` -> `[{ name, priceLabel?, description? }]`
  - `businessHours` -> `[{ day, open?, close?, closed? }]`
  - `faqs` -> `[{ question, answer }]`
  - `media` -> `{ logo?, coverImages?, gallery?, videos?, certificates? }`
  - `policies` -> `{ paymentMethods?, homeService?, emergencyService?, appointmentRequired?, cancellationPolicy? }`
  - `socialLinks` -> `{ instagram?, facebook?, youtube? }`
  - `verification` -> `{ gstNumber?, licenseNumber?, verifiedOn? }`

## Reels
- `GET /reels`

### Query params
- `q`
- `city`
- `verified`
- `page`
- `limit`

## Offers
- `GET /offers`

### Query params
- `activeOnly`: default `true`

## Leads
- `GET /leads`
- `POST /leads`

### `POST /leads` payload
```json
{
  "businessId": "b-1",
  "name": "Rahul Patil",
  "phone": "+919888777666",
  "message": "Need quote for home wiring",
  "source": "search"
}
```

## Categories
- `GET /categories`

## Reviews
- `GET /reviews`
- `POST /reviews` (optional bearer token to attach user)

### Query params
- `businessId` (optional)
- `page`
- `limit`

## Seller Analytics
- `GET /seller/analytics?businessId=<uuid>` (requires `Authorization: Bearer <access_token>`)

## Admin Moderation (Admin only)
- `GET /admin/listings?status=pending|active|rejected`
- `PATCH /admin/listings/:id/activate`
- `PATCH /admin/listings/:id/reject`

## Auth (Express + Supabase)
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/password/reset/request`
- `POST /auth/password/reset/confirm` (requires `Authorization: Bearer <recovery_access_token>`)
- `POST /auth/login/otp/send`
- `POST /auth/login/otp/verify`
- `GET /auth/me` (requires `Authorization: Bearer <access_token>`)
- `POST /auth/logout`

Auth endpoints are served by `backend/server.js`.
- Email/password uses Supabase Auth.
- Phone OTP uses backend-managed OTP table `public.phone_otps`.
- OTP verify returns an app JWT access token (`tokenType: app`) used with `/auth/me`.
- In non-production without Twilio config, `/auth/login/otp/send` returns `devOtp` for local testing.

## Data persistence
- Express backend uses Supabase Postgres tables (`businesses`, `reels`, `offers`, `leads`, `reviews`, `profiles`).
- Run `backend/sql/create_profiles.sql` and `backend/sql/create_marketplace_tables.sql` in Supabase SQL editor.
- Run `backend/sql/create_phone_otps.sql` for custom OTP flow.
- Existing Next `/api/*` routes still run locally for frontend dev compatibility.
