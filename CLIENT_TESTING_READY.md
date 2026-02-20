# Client Testing Ready Notes

Date: 2026-02-15  
Status: Ready for client testing demo

## Primary demo routes
- `/` Home marketplace
- `/search` Search and listing cards
- `/discover` Reels-style discovery
- `/business/b-1` Internal business detail page
- `/free-listing` Seller onboarding and form submit
- `/offers` Promotion and plans page
- `/stories` Success stories page
- `/login` Login page
- `/register` Register page
- `/about` About Namaste Bharat
- `/contact` Contact and support page
- `/design-review` Review hub for guided walkthrough

## API routes for quick checks
- `/api`
- `/api/health`
- `/api/businesses?limit=5`
- `/api/reels?limit=5`
- `/api/offers`
- `/api/categories`
- `/api/leads`
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/session`
- `/api/auth/logout`
- `/api/auth/google`

## Suggested client demo flow
1. Start at `/design-review`.
2. Open `/` and show marketplace navigation and visuals.
3. Open `/search` and perform sample query.
4. Open a business detail from listing cards.
5. Open `/free-listing` and submit a test listing.
6. Open `/offers` and `/stories` for monetization + trust narrative.
7. Test login/register flow via `/login` and `/register`.
8. Validate backend response at `/api/health`.

## Known demo limitations
- Login/register with phone-password is implemented for testing.
- Google login currently redirects to Google sign-in page (no OAuth callback integration yet).
- No live payment integration yet.
- No live WhatsApp Business API integration yet.
- Listing verification workflow is not admin-moderated yet.
