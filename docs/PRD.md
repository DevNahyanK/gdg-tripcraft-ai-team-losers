# Product Requirements Document (PRD)

## Project Name: TripCraft AI
**Product Direction:** Smart 3D & AI-Powered Travel Planning Workspace
**Event Context:** GDG Live Build Workshop at UIT Auditorium
**Document Status:** Ready for MVP Implementation

---

### Context
* **Target Users:** Leisure travelers, vacation planners, students, and busy working professionals who want fast, organized, and visually engaging travel plans without spending hours cross-referencing blogs, maps, and spreadsheets.
* **Main Problem:** Traditional itinerary creation is fragmented, boring, and tedious. Users waste hours collecting recommendations across disjointed sites, struggling to estimate realistic daily budgets, and getting overwhelmed by flat, uninspiring text lists and static tables.
* **Unique Value:** TripCraft AI combines an interactive 3D spatial globe with an AI itinerary engine. Users select a destination, dates, and budget, watch the 3D canvas dynamically fly into the chosen region, and instantly receive a curated day-by-day plan with animated schedule cards, itemized cost estimates, and real-time persistence.

---

### 1. PROBLEM STATEMENT
Travel planning currently suffers from high cognitive overhead and fragmented tools. An average traveler visits over 10 different websites, blogs, and spreadsheet templates to organize a 3-to-5-day trip, leading to planning fatigue and inaccurate daily budgeting. Existing tools present output as plain text tables or static lists that fail to convey spatial awareness, visual excitement, or instant clarity. Travelers need an all-in-one, highly visual workspace that turns basic inputs (destination, trip duration, budget tier) into a structured, day-wise schedule with realistic cost estimates and interactive 3D/animated visual feedback in under 15 seconds.

---

### 2. GOALS & OBJECTIVES
* **SMART Goal 1:** Enable a first-time user to generate a structured, multi-day itinerary with accurate time slots and budget allocations within **15 seconds** of entering inputs.
* **SMART Goal 2:** Achieve a **90% completion rate** for the core user loop (Login → 3D Destination Selection → AI Plan Generation → Itinerary Save to Database) during evaluation.
* **SMART Goal 3:** Maintain visual rendering performance above **55 FPS** on mid-tier desktop and mobile browsers during 3D globe interaction and card transitions.
* **SMART Goal 4:** Ensure **100% data persistence reliability** so that saved trips are immediately retrievable across user sessions without data loss.

---

### 3. SUCCESS METRICS
* **Time-to-Itinerary:** Average time from input submission to fully rendered plan is under **12 seconds**.
* **Plan Retention Rate:** Over **75%** of generated itineraries are explicitly saved to the user's dashboard.
* **UI Interaction Engagement:** At least **80%** of active users interact with the 3D globe controls (rotate, pin selection, zoom) before or during planning.
* **Workflow Error Rate:** Less than **3%** of generation requests fail due to validation or timeout errors.

---

### 4. TARGET PERSONAS

#### Persona 1: Hamza – The Spontaneous Weekend Explorer
* **Demographics:** Age 23, Final-year University Student, Karachi.
* **Pain Points:** Wants to explore northern regions or nearby cities with friends but hates manual research, creating spreadsheets, or calculating itemized budgets.
* **Goals:** Generate an instant, realistic 3-day itinerary with verified local food stops, sight-seeing points, and estimated pocket expenses.
* **Technical Proficiency:** High (daily smartphone and web user; expects slick, animated, app-like web interfaces).

#### Persona 2: Sarah – The Detail-Conscious Vacationer
* **Demographics:** Age 31, Working Marketing Manager, frequent domestic/international traveler.
* **Pain Points:** Gets overwhelmed by cluttered travel blogs; needs a clean timeline showing morning, afternoon, and evening activities with accurate travel time buffers.
* **Goals:** Quickly customize and review high-level vacation itineraries, save multiple trip options, and access them easily while traveling.
* **Technical Proficiency:** Moderate (uses productivity tools daily; values clean aesthetics, visual clarity, and responsiveness).

---

### 5. FEATURES & REQUIREMENTS

#### Tier P0 (Must-Have for Workshop MVP)

##### Feature P0.1: Interactive 3D Hero Canvas & Destination Picker
* **Description:** An interactive 3D globe in the hero section displaying popular travel hubs with animated pins. Selecting or searching a city animates the camera to focus on that destination.
* **User Story:** *As a traveler, I want to interact with a 3D globe and select my destination visually so that planning feels engaging and spatially intuitive.*
* **Acceptance Criteria:**
  1. The 3D globe must render smoothly on initial load without blocking UI thread interactions.
  2. Users can click pins or use an autocomplete search bar to select a destination.
  3. Camera smoothly transitions to the selected coordinates within 1.5 seconds.
  4. Fallback visual state is displayed if WebGL is unavailable on the client device.
* **Success Metric:** 100% successful coordinate transitions upon destination selection.

##### Feature P0.2: AI-Powered Multi-Day Itinerary Engine
* **Description:** Form where users provide destination, duration (1 to 7 days), travel style (budget, moderate, luxury), and interest tags. The backend generates a day-by-day plan with timings, spots, and descriptions.
* **User Story:** *As a user, I want an AI to construct a balanced day-wise plan based on my budget and duration so that I don't have to plan each hour manually.*
* **Acceptance Criteria:**
  1. Inputs are strictly validated (duration between 1 and 7 days, valid destination string).
  2. Plan renders as chronological day-by-day cards (Morning, Afternoon, Evening).
  3. Every activity includes title, location, description, and suggested duration.
  4. Structured format guarantees no incomplete or broken text blocks.
* **Success Metric:** Generation response received within 12 seconds.

##### Feature P0.3: Animated Itinerary Timeline & Budget Breakdown
* **Description:** Interactive display cards with animated entry transitions, showing daily itineraries and a live estimated cost breakdown (Food, Stay, Activities, Commute).
* **User Story:** *As a traveler, I want to see animated day schedules and a budget breakdown so that I immediately understand costs and timings.*
* **Acceptance Criteria:**
  1. Day cards animate into view with staggered entry transitions as the user scrolls.
  2. Budget summary displays total estimated cost alongside itemized categories.
  3. Currency toggle or clear default currency is visibly labeled.
* **Success Metric:** 0 UI layout shifts during card rendering and animation.

##### Feature P0.4: User Authentication & Persistent Trip Storage
* **Description:** User signup/login with email/password or OAuth, enabling users to save generated itineraries to their personal dashboard and view them anytime.
* **User Story:** *As an authenticated user, I want to save my generated trips so that I can revisit them across devices.*
* **Acceptance Criteria:**
  1. User can register, log in, and log out with clear feedback.
  2. Clicking "Save Trip" persists the full itinerary and budget structure to the database.
  3. Saved trips are listed in a "My Trips" dashboard with trip summary cards.
  4. Unauthorized users are prompted to log in before saving.
* **Success Metric:** 100% data integrity for saved trip objects.

---

#### Tier P1 (Should-Have for Post-Workshop Launch)
* **P1.1: Activity Customization & Deletion:** Let users delete or swap individual activities within an itinerary and recalculate daily budgets in real-time.
* **P1.2: Shareable Trip Links:** Public read-only URLs allowing users to share their animated itinerary page with travel partners.
* **P1.3: Interactive 2D Day Map Route:** Synchronize selected day's activities with a route polyline map showing stops in sequence.

---

#### Tier P2 (Nice-to-Have / Future Enhancements)
* **P2.1: Real-Time Collaborative Trip Editing:** Multi-user live editing of itinerary items using real-time sync.
* **P2.2: Live Flight & Hotel API Pricing:** Replacing simulated budget estimations with live booking partner APIs.
* **P2.3: Offline PWA Mode:** Offline caching of saved itineraries for zero-connectivity access while traveling.

---

### 6. EXPLICITLY OUT OF SCOPE (MVP V1.0)
1. **No Live Payment Gateway:** No real credit card or Stripe checkouts; all budgets and expenses are simulated estimates.
2. **No Real-Time Flight/Hotel Booking:** The platform will not process actual reservations or ticket ticketing.
3. **No Native Mobile App:** MVP is strictly a responsive web application; no iOS or Android native packages.
4. **No Multi-City Complex Routing:** Itineraries are restricted to single destination hubs per trip session.
5. **No Turn-by-Turn GPS Navigation:** Does not replace Google Maps for live driving instructions.
6. **No Real-Time Multi-User Whiteboard:** Real-time multi-cursor collaboration is deferred to later versions.

---

### 7. USER SCENARIOS & FLOWS

#### Scenario 1: Standard Trip Planning Flow (Happy Path)
* **Context:** A registered user wants to plan a 4-day trip to Hunza Valley on a moderate budget.
* **User Actions:**
  1. User logs into TripCraft AI and visits the home canvas.
  2. Interacts with the 3D globe, selects "Hunza Valley", chooses "4 Days", and selects "Moderate Budget".
  3. Clicks **"Craft Itinerary"**.
* **System Response:**
  1. 3D camera focuses on the region coordinates; an animated loading indicator informs the user.
  2. AI engine generates structured day-by-day plan with activities and budget estimates.
  3. The page animates to the result view displaying 4 interactive day cards and a budget panel.
  4. User clicks **"Save Itinerary"**; system writes to the database and shows a success toast.
* **Expected Outcome:** Trip is stored in the user profile and visible on the dashboard.

#### Scenario 2: Unauthenticated Visitor Flow (Conversion Path)
* **Context:** A new visitor lands on the application from a shared link or demo presentation.
* **User Actions:**
  1. Visitor interacts with the 3D globe and generates a 3-day itinerary for Dubai.
  2. Reviews the animated schedule and clicks **"Save to My Trips"**.
* **System Response:**
  1. System displays an authentication modal: *"Sign in to save and access your trip anytime."*
  2. Visitor enters credentials and creates an account.
  3. System registers the user, automatically saves the active itinerary to their account, and redirects to the saved trip view.
* **Expected Outcome:** Frictionless transition from guest state to authenticated saved state without losing generation progress.

#### Scenario 3: AI Service Latency or Rate-Limit Handling (Edge Case)
* **Context:** High network latency or temporary upstream AI API error during generation.
* **User Actions:** User submits a request for a 7-day itinerary during unstable network connectivity.
* **System Response:**
  1. If generation exceeds 15 seconds, UI displays a reassuring status message (*"Optimizing regional routes..."*).
  2. If the API returns a rate-limit or timeout error, the system does not crash or display raw error traces.
  3. UI presents a friendly fallback card: *"We couldn't generate this plan right now. [Retry] or [Load Curated Template]."*
  4. Clicking "Load Curated Template" populates an instant, pre-verified fallback itinerary for the selected city.
* **Expected Outcome:** User flow is preserved without broken layouts or blank screens.

---

### 8. NON-FUNCTIONAL REQUIREMENTS
* **Performance:**
  * Initial page load under **2.5 seconds** on a standard 4G/broadband connection.
  * 3D Canvas initialization must not drop below **50 FPS** on hardware-accelerated devices.
* **Security:**
  * Strict Row-Level Security (RLS) on the database so users can only read/write their own itineraries.
  * All external AI credentials and database secrets stored in protected environment variables and never exposed to the client bundle.
* **Accessibility & Responsiveness:**
  * Fully responsive layout adapting from mobile screens (375px) up to 4K displays.
  * Keyboard navigability for all core input fields and action buttons.
* **Reliability:**
  * Client-side error boundaries preventing unhandled UI crashes.
  * Deterministic data fallbacks for demo presentation safety.

---

### 9. DEPENDENCIES & CONSTRAINTS
* **Workshop Scope Constraint:** Must deliver a verifiable vertical slice (Auth → 3D Interaction → AI Generation → DB Persistence) within the workshop schedule.
* **Client Hardware:** 3D globe components must detect WebGL support and provide an animated 2D SVG canvas fallback for low-end machines.
* **External Services:**
  * Authentication & Database: Supabase
  * AI Structured Output: Google Gemini API via SDK
  * Web Hosting: Vercel

---

### 10. TIMELINE & MILESTONES

| Milestone | Target Horizon | Deliverables |
| :--- | :--- | :--- |
| **Milestone 1: Foundations** | Hour 0 – 1 | Supabase setup (Auth + Tables + RLS), repo initialization, Next.js Tailwind base. |
| **Milestone 2: Core 3D & Form** | Hour 1 – 2 | 3D hero canvas integration, destination input form, client validation. |
| **Milestone 3: AI Engine & Pipeline**| Hour 2 – 3 | Gemini API integration with structured Zod schema output, itinerary cards & budget rendering. |
| **Milestone 4: Polish & Deployment**| Hour 3 – 4 | Framer Motion animations, "Save Trip" database link, Vercel production deployment, live demo test. |