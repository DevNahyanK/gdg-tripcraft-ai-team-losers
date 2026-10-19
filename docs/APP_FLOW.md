# Application Flow Documentation (APP_FLOW.md)

## App Name: TripCraft AI
**Product Description:** An intelligent, full-stack 3D travel and itinerary planner built with Next.js, Supabase, Three.js, and Google Gemini AI. Users explore destinations via an interactive 3D globe, generate structured multi-day itineraries with estimated budgets, and persist their travel plans in an authenticated dashboard.

---

### 1. ENTRY POINTS

* **Direct URL Access:**
  * `/` (Root Landing & 3D Interactive Canvas)
  * `/explore` (Destination Browser & Itinerary Builder)
  * `/auth` (Authentication: Sign Up / Sign In)
  * `/dashboard` (Protected User Saved Trips Workspace)
* **Deep Links:**
  * `/itinerary/[id]` (View specific saved or public travel plan)
  * `/auth/callback` (OAuth email confirmation and Supabase redirect handler)
* **OAuth / Social Login Redirects:**
  * Google OAuth provider redirect returning to `/dashboard` with session exchange.
* **Search Engines & Marketing Links:**
  * Landing at `/` with referral query strings (e.g., `/?ref=gdg-showcase`).

---

### 2. CORE USER FLOWS

#### Flow 1: User Onboarding & Registration

##### Happy Path
1. **Page:** `/auth?mode=signup`
2. **UI Elements:** Glassmorphism card, email input, password input, confirm password input, "Continue with Google" button, submit button, switch link to login.
3. **User Actions:** User enters email, valid password (min 8 chars), and clicks "Create Account".
4. **System Responses:** Client validates fields, calls Supabase `auth.signUp()`, displays loading spinner on button, transitions to verification pending state.
5. **Validation Rules:** Valid email format; password length >= 8 with at least one number; matching confirmation password.
6. **Next Page / State:** If auto-confirm is active, redirect to `/dashboard`; otherwise show "Check your email for confirmation" banner.
7. **Success Criteria:** User row created in `auth.users` and linked row initialized in `public.profiles`.

##### Error States
* **Email Already Exists:** Inline alert banner under form: *"An account with this email already exists. [Log in instead]."*
* **Weak Password:** Input border turns crimson with helper text: *"Password must contain at least 8 characters and 1 number."*
* **Network Failure:** Dismissible toast notification: *"Unable to reach authentication server. Please check your internet connection."*

##### Edge Cases
* **Tab Closed Mid-Confirmation:** User returns directly via email verification link; session restores automatically to `/dashboard`.
* **OAuth Account Linking:** If user previously signed up via email and tries Google login with the same address, system handles identity linking according to Supabase auth settings.

---

#### Flow 2: Main Feature Usage (3D Destination Selection → AI Itinerary Generation → Save Trip)

##### Happy Path
1. **Page:** `/` or `/explore`
2. **UI Elements:**
   * Full-screen 3D globe with interactive destination markers and orbit controls.
   * Floating control dock: Destination search/select, Duration slider (1–7 days), Budget level picker (Budget, Moderate, Luxury), Interest pills (Culture, Food, Adventure, Nature).
   * "Craft Itinerary" primary CTA button with subtle shimmer animation.
3. **User Actions:**
   * User rotates globe, clicks the pin for "Hunza Valley" (or selects it from autocomplete).
   * Selects "4 Days", "Moderate Budget", and tags "Nature" + "Food".
   * Clicks "Craft Itinerary".
4. **System Responses:**
   * 3D camera smoothly zooms and focuses on coordinates (lat/lng).
   * A frosted-glass loading overlay displays dynamic step indicators: *"Analyzing local spots..."*, *"Optimizing daily routes..."*, *"Calculating budget breakdown..."*.
   * API invokes Gemini model using a strict Zod schema for validated JSON.
   * View switches to `/itinerary/preview` with Framer Motion staggered animations rendering day-by-day activity cards and animated expense dials.
5. **User Action (Save):** User clicks "Save Itinerary".
6. **System Responses:** Backend writes trip, days, and activities to Supabase; toast displays *"Trip saved to your dashboard!"*; button switches to "Saved" with checkmark icon.
7. **Success Criteria:** Complete itinerary rendered with zero layout shift and persisted to PostgreSQL with foreign keys intact.

##### Error States
* **AI API Timeout or 429 Rate Limit:** After 15 seconds without a model response, overlay transitions to fallback state: *"AI generation took too long. Load curated template for Hunza Valley?"* with instant 1-click fallback injection.
* **Invalid Form State:** "Craft Itinerary" CTA remains disabled until a destination is selected and duration is >0 days.
* **Database Write Failure:** If database is unreachable on save, trip data remains cached in `localStorage` with a retry prompt: *"Save failed. [Try Again]"*.

##### Edge Cases
* **Browser Back Button Pressed During Generation:** AbortController cancels the active fetch request; on return, user inputs remain preserved in the form state.
* **Unauthenticated Save:** If guest clicks "Save Itinerary", an auth modal appears over the preview; after successful login, the active itinerary automatically attaches to the new account without regeneration.

---

#### Flow 3: Dashboard & Trip Management

##### Happy Path
1. **Page:** `/dashboard` (Authenticated)
2. **UI Elements:** User avatar, stats row (Total Trips Planned, Days Traveled, Estimated Spend), grid of saved trip cards (Destination image, dates, budget tag, "View", "Delete" actions).
3. **User Actions:** User clicks on a trip card.
4. **System Responses:** Navigates to `/itinerary/[id]` with full timeline, map route points, and cost breakdowns.
5. **Deletion Action:** User clicks trash icon → confirmation dialog appears → confirms → item removes with exit animation; Supabase executes cascading delete across associated day and activity rows.
6. **Success Criteria:** Dashboard updates live; deleted trip cannot be retrieved.

##### Error States
* **Failed Deletion:** Toast error: *"Could not delete trip. Please try again."* Row reverts from optimistic deletion.
* **Empty State:** If user has 0 saved trips, dashboard displays an animated illustration with CTA: *"You haven't planned any trips yet. [Explore Destinations]"*.

##### Edge Cases
* **Session Expiration While on Dashboard:** Any mutating action redirects gracefully to `/auth` with return URL query `?redirect=/dashboard`.

---

### 3. NAVIGATION MAP

```text
TripCraft AI Application
│
├── / (Landing Page & 3D Interactive Canvas) [Public]
│   ├── Destination Quick Selector
│   ├── Featured Popular Itineraries (Read-Only)
│   └── 3D Globe Viewport
│
├── /explore (Interactive Planning Workspace) [Public / Hybrid]
│   ├── Step 1: Destination Selection (3D Camera Focus)
│   ├── Step 2: Trip Parameter Form (Days, Budget, Preferences)
│   └── /itinerary/preview (Generated AI Timeline View)
│       ├── Save Trip Action ──── (If unauthenticated) ──┐
│       └── Share Modal                                 │
│                                                       │
├── /auth (Authentication Portal) [Public] <────────────┘
│   ├── /auth?mode=login
│   ├── /auth?mode=signup
│   └── /auth/callback (Supabase Session Token Exchange)
│
├── /dashboard (Saved Trips Workspace) [Protected - Auth Required]
│   ├── Trip Metrics Overview
│   ├── Saved Itineraries Grid
│   └── Profile Settings Modal
│
└── /itinerary/[id] (Dedicated Itinerary View) [Public / Protected]
    ├── Day-wise Accordion Schedule
    ├── Expense Breakdown Chart
    └── Printable / Export View