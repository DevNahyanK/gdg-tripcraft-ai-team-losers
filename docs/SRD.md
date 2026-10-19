# SRD: TripCraft AI MVP

> Keep this short. Update it only when the build scope changes.

## Goal
Help a traveler explore destinations on an interactive 3D canvas, generate a structured AI itinerary with estimated budgets, and save the trip to their dashboard.

## Users
- **Guest Explorer:** interacts with the 3D globe, configures trip inputs, and previews generated itineraries.
- **Authenticated Traveler:** signs in, saves generated plans, and accesses or deletes trips from their personal dashboard.

## MVP Workflow
1. User interacts with the 3D globe to pick a destination (or searches via input).
2. User submits duration (1–7 days) and budget preference.
3. System invokes the Gemini API using structured Zod validation to construct the day-wise plan and budget estimate.
4. User signs in via Supabase Auth and saves the generated itinerary.
5. User views the saved trip in their persistent dashboard.

## Must-Have
- Interactive 3D hero canvas with responsive 2D fallback.
- Form validation (destination required, duration between 1 and 7 days).
- Gemini AI generation mapped strictly to typed day/activity slots and category costs.
- Supabase Auth (Email/Password) and PostgreSQL persistence with Row-Level Security (RLS).
- Dashboard displaying saved trip cards with view and delete capabilities.
- Graceful error recovery: curated destination fallback if the AI API times out or hits rate limits.
- Clean UI loading, empty, and failure states.

## Not in MVP
Real booking integrations (flights, hotels), live payment processing, multi-city travel routing, turn-by-turn GPS navigation, and real-time collaborative editing.

## Acceptance Check
A visitor selects a destination, receives a multi-day itinerary with an itemized budget within 15 seconds, logs in to save the trip, and verifies the trip persists upon refreshing the dashboard; unauthenticated requests cannot access private user itineraries.

## Build Notes
- **Frontend:** Next.js (App Router), Tailwind CSS, Framer Motion, Three.js / React Three Fiber.
- **Backend / AI:** Next.js Route Handlers / API, Google Gemini API with Zod structured output validation.
- **Auth & Database:** Supabase (PostgreSQL with RLS).
- **Hosting:** Frontend on Vercel; database on Supabase Cloud.