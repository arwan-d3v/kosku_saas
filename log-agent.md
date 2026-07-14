## Log Agent
- **Last Edited By:** Antigravity (Agent)
- **Timestamp:** Mon Jul 13 2026
- **Changes Made:**
  - Synchronized mobile and desktop UI layouts in `apps/web/src/app/page.tsx` for consistent navigation and responsive hero sections.
  - Implemented dynamic city filtering reading directly from properties in the database instead of hardcoded city arrays on both Landing and Search pages.
  - Updated Backend `properties.service.ts` and `properties.controller.ts` to accept `city` input upon property creation/update, replacing the 'Unknown' hardcoded value.
  - Added a "Kota / Area" input field in the Owner Dashboard for adding/editing properties (`apps/web/src/app/dashboard/owner/properties/page.tsx`).
  - Built a Smart Recommendation Scoring System for the Landing Page and Search Page (`calculateScore(prop)`). Prioritizes properties with available rooms (+100 base score & +5 per available room) and multiple facilities (+10 per facility). Fully booked properties are dynamically pushed to the bottom of the search results.
  - Fixed the non-functional "Keluar" (Logout) button on the desktop owner layout (`apps/web/src/app/dashboard/owner/layout.tsx`).
- **Scan for Next Needs:**
  - Consider moving the sorting/scoring algorithm to the backend (`properties.service.ts`) as the database scales, potentially integrating actual database ratings and repetitive rental metrics.
  - Continue implementing offline payment receipt upload flow to Cloudflare R2 as planned previously.
- **Priority Recommendations:** Medium - Finish the offline payment upload receipt functionality for owner dashboard and tenant view.

- **Agent:** Jules
- **Timestamp:** 2026-07-13 12:14:06
- **Changes Made:** Adjusted the mobile UI layout for the Property Details page (`apps/web/src/app/properties/[id]/page.tsx`). Elevated the "Sticky Bottom Action Bar" (Booking Button) using Tailwind's `bottom-[72px]` on mobile devices to prevent it from overlapping with the `BottomNavigation` bar. Increased the main container padding to `pb-40` on mobile. Removed temporary setup files.
- **Scan for Next Needs:**
  1. The user previously mentioned an issue regarding an onboarding flow missing after authentication. Currently, both login and registration Google OAuth callbacks are pointing to `/search`. The implementation of the missing onboarding page (`/onboarding`) might be the next immediate priority.
- **Priority Recommendations:** Follow up with the user on implementing the `onboarding` page after authentication success, as they reported it missing/returning to localhost.

- **Agent:** Jules
- **Timestamp:** 2026-07-13 13:00:00
- **Changes Made:**
  1. Created a new reusable `CountdownTimer` component (`apps/web/src/components/CountdownTimer.tsx`) with a modern, box-based UI for displaying remaining time (hours, minutes, seconds).
  2. Updated the Tenant Dashboard (`apps/web/src/app/dashboard/tenant/page.tsx`) to use the new `CountdownTimer` for tracking DP expiration.
  3. Updated the Owner Dashboard (`apps/web/src/app/dashboard/owner/page.tsx`) to integrate the `CountdownTimer` into the Early Bird (DP 10%) and Booking Aman (DP 25%) transaction cards, allowing owners to view live countdowns.
- **Scan for Next Needs:**
  1. We need to implement the onboarding flow (`/onboarding`) after Google authentication as mentioned in earlier tasks.
  2. Verify that Owner Dashboard's room management actually provides toggle switches to enable/disable `allow_dp_10` and `allow_dp_25` when creating or editing a room, as a quick code scan showed it might be missing from the UI form.
- **Priority Recommendations:** Priority 1: Onboarding page. Priority 2: Owner UI for setting `allow_dp_10` and `allow_dp_25` on rooms.

---

**Last Editor:** Jules (Agent)
**Timestamp:** Mon Jul 13 2026

**Changes Made:**
*   Modified `apps/web/src/app/login/page.tsx` and `apps/web/src/app/register/page.tsx` to override `redirectTo` for Google OAuth using `process.env.NEXT_PUBLIC_SITE_URL` to prevent misrouting to `localhost:3000` in production environments.
*   Updated `apps/web/src/app/dashboard/owner/properties/[id]/page.tsx` to include `allow_dp_10` and `allow_dp_25` boolean toggles for room down payment settings. Added matching UI elements (checkboxes) and synchronized state updates with the API payload.

**Next Needs:**
*   User needs to add `NEXT_PUBLIC_SITE_URL` environment variable to their frontend deployment (e.g. Vercel) and point it to the production URL (`https://skita-saas.vercel.app`).
*   User must ensure the newly configured Vercel deployment URL (`https://skita-saas.vercel.app/*`) is registered in Supabase's authentication allow list.

**Priority Recommendations:**
1.  Verify the authentication callback redirect succeeds in production after environment variables are deployed.
2.  Validate the backend API (`RoomsController` and `RoomsService`) successfully persists the newly enabled down payment flags.

---

**Last Editor:** Antigravity (Agent)
**Timestamp:** Tue Jul 14 2026

**Changes Made:**
1. **Photo Management:** Added functionality to delete photos in Property and Room editors. Enforced validation rules (min 4 photos for properties, min 3 photos for rooms).
2. **DP Display Sync:** Updated Tenant and Owner Dashboards to correctly display actual DP amounts instead of full prices when users choose a Down Payment. Added clear payment type badges (DP 10%, DP 25%).
3. **Countdown Timer:** Integrated the CountdownTimer component into both Owner and Tenant dashboards for DP transactions. Modified it to automatically display the remaining time in "Days" when the time left exceeds 24 hours.
4. **Custom DP & Balance Settlement:**
   - Designed a database migration to introduce `CUSTOM_DP` type, custom percentage, and duration in the `rooms` table. Added `balance_paid` tracking to the `bookings` table.
   - Updated the API to accommodate balance payments via Snap Simulator and to calculate Custom DP logic.
   - Enhanced the UI to allow owners to define Custom DP per room, allow tenants to choose it during booking, and provide a "Lunasi Sekarang" (Pay Balance) button on the tenant dashboard.
5. **Rebranding:** Renamed all instances of "KosanKita", "KosKita", and "KosKu" to the new brand **"KosKosanKu"** globally across layout titles, dashboards, and landing pages.

**Next Needs:**
*   Ensure the latest database migration `20240715000000_add_custom_dp.sql` is executed in the production/cloud Supabase environment.
*   Test the full Custom DP and balance payment flow from booking to final settlement.

**Priority Recommendations:**
1. Manually apply the new SQL migration for Custom DP if using a managed Supabase project.
2. Deploy the latest frontend and backend builds.

---

**Last Editor:** Antigravity (Agent)
**Timestamp:** Tue Jul 14 2026

**Changes Made:**
1. **Search Experience:** Completely overhauled the search page layout to include a desktop sidebar and a mobile bottom sheet modal for advanced filtering. Added real-time filtering for City, Facilities (multi-select), Price Range, DP Availability, and Sorting.
2. **Landing Page Ads:** Implemented a continuous marquee "Running Ads" banner. Added a clickable "Bisa DP" badge that routes users to the search page with the DP filter pre-enabled.
3. **Tenant Dashboard:** Added "Top Up Deposit" functionality, allowing tenants to pay an auto-renewal guarantee.
4. **Owner Dashboard Modernization:** Upgraded the UI to a professional analytics view with Recharts (Dual-line chart for Revenue vs Rentals). Added a print layout and button for generating business reports. Added an "Active Tenants" table to track auto-renewal deposits.
5. **Database Enhancements:** Created migrations for `auto_renewal_deposit` in bookings and custom `price_per_day` / `price_per_week` in rooms to support flexible pricing options.
6. **Navigation Fix:** Fixed a bug in `BottomNavigation` where the "Akun" tab forced authenticated users back to the `/login` page.

**Next Needs:**
* Apply the two latest migrations (`20240716000000_add_booking_deposit.sql` and `20240717000000_add_daily_weekly_pricing.sql`) to the Supabase database.
* The backend API (`properties/rooms`) needs to be updated to accept and return the new daily and weekly pricing fields if the owner decides to use them.

**Priority Recommendations:**
1. Ensure the new migrations are pushed to the database (via Web UI since CLI is not configured locally).
2. Test the print report functionality on the Owner Dashboard to ensure formatting holds up on physical prints/PDFs.
