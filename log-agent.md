## Last Update
* **Agent:** Jules
* **Timestamp:** 2024-07-13
* **Changes Made:**
    * Implemented UI improvements in `apps/web/src/app/page.tsx` & `apps/web/src/app/properties/[id]/page.tsx` for mobile view.
    * Changed image carousel layout from `snap-x` overlap issue to `snap-x flex-nowrap` for proper horizontal scrolling.
    * Added Google Auth UI handling `signInWithOAuth` in `apps/web/src/app/login/page.tsx` & `apps/web/src/app/register/page.tsx`.
    * Added Auth Gate to the Maps component in `apps/web/src/app/properties/[id]/page.tsx` restricting it from unauthenticated users.
    * Implemented visual notification and countdown timer in `apps/web/src/app/dashboard/owner/page.tsx` for early bird down payments, complete with functional interactive hooks (`onClick`) for Confirm Arrival and Upload Offline Receipt.
    * Added mobile card layouts to the `owner/properties/page.tsx` to handle vertical responsiveness better.
    * Replaced dummy static properties on homepage with actual dynamic fetch from backend `/public/properties`.
* **Scan for Next Needs:**
    * Create a Google Cloud Platform OAuth application for Supabase Auth and configure the Google Provider with corresponding Client ID and Secret.
    * Thorough end-to-end integration testing for booking -> early bird payment -> dashboard notification workflow with live Midtrans integration.
    * Need to map real backend data endpoint to the Early bird dashboard array (currently uses mock array state in the dashboard view).
* **Priority Recommendations:**
    * 1. Set up Google Auth in Supabase dashboard.
    * 2. Replace mock data with real database tables in dashboard charts/notifications logic.
