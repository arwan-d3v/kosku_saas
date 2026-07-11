# Kosan Management SaaS MVP

Marketplace & Property Management System built with Next.js, NestJS, Supabase, Cloudflare R2, and Midtrans.

## Project Structure
- `apps/web`: Next.js (Frontend)
- `apps/api`: NestJS (Backend)
- `supabase/`: Database migrations and RLS policies

## Prerequisites
- Node.js (v18+)
- npm / pnpm
- Supabase Account
- Cloudflare R2 Account
- Midtrans Account (Sandbox)

## Local Setup Instructions

### 1. Database & Auth (Supabase)
1. Create a new project in Supabase.
2. Go to the **SQL Editor**.
3. Copy and execute the content of `supabase/migrations/20240520000000_initial_schema.sql`.
4. This will set up tables, triggers for auth synchronization, and RLS policies.

### 2. Backend (NestJS)
1. Navigate to `apps/api`.
2. Install dependencies: `npm install`.
3. Create `.env` from `.env.example` and fill in your credentials.
4. Run the development server: `npm run start:dev`.
5. API will be available at `http://localhost:3001`.

### 3. Frontend (Next.js)
1. Navigate to `apps/web`.
2. Install dependencies: `npm install`.
3. Create `.env.local` from `.env.example` and fill in your credentials.
4. Run the development server: `npm run dev`.
5. Web app will be available at `http://localhost:3000`.

## Features Initialized
- [x] Monorepo structure
- [x] NestJS Modules: Auth, Properties, Rooms, Bookings, Payment
- [x] Supabase Auth Sync Trigger
- [x] Row Level Security (Tenant Isolation)
- [x] Cloudflare R2 presigned URL upload flow (ready to implement in services)
- [x] Midtrans Core API integration ready (Backend)

## Storage Policy (Cloudflare R2)
- `properties/{tenant_id}/{property_id}/images/`
- `users/{user_id}/documents/`


## Running the project concurrently
To run both API and Web in development mode:

1. Open a terminal for the API:
   `cd apps/api && npm run start:dev`
2. Open another terminal for the Web:
   `cd apps/web && npm run dev`
