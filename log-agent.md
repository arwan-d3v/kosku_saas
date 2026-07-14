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
