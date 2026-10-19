### File 3: `TEST_PLAN.md`

```markdown
# Test Plan: TripCraft AI MVP

> Test the primary user journey (Explore → Generate → Save → Dashboard) and critical failure boundaries. Keep it narrow, testable, and focused on MVP reliability.

---

## Critical Tests

| ID | Scenario | Expected Result |
|---|---|---|
| **T1** | User selects a destination on the 3D globe / search bar and requests an itinerary | Camera focuses on coordinates, loading state displays, and a multi-day plan renders with zero broken JSON. |
| **T2** | Authenticated user clicks "Save Itinerary" on a generated trip | Trip, days, and activities persist to Supabase; item appears immediately in `/dashboard`. |
| **T3** | User reloads `/dashboard` or navigates directly to `/itinerary/[id]` | Saved trip loads with all day slots, activity descriptions, and cost estimates intact. |
| **T4** | Unauthenticated user attempts direct access to `/dashboard` or calls trip-saving endpoints | Route middleware redirects to `/auth` with return URL; raw API returns `401 Unauthorized`. |
| **T5** | User B attempts to access or delete User A's private saved trip via direct ID | Supabase Row-Level Security (RLS) denies access (`403 Forbidden` / 0 rows returned). |
| **T6** | Form submitted with invalid duration (e.g., 0 days, negative, or >7 days) or blank destination | Client validation blocks submission; inline error highlights invalid fields; no AI API call is made. |
| **T7** | AI API timeout or rate-limit (429) occurs during generation | UI gracefully surfaces an error banner with a 1-click fallback button to load a curated template; does not crash. |
| **T8** | Client device lacks WebGL support for the 3D canvas | WebGL context check fails safely and displays the responsive 2D fallback map without console exceptions. |

---

## Minimal Automated Tests (Suggested for Stack)

* **Zod Schema Validation Test (Unit):** Verify that mock Gemini JSON responses match the exact schema contract for `ItineraryResponse` before reaching frontend components.
* **Supabase RLS Policy Test (Integration):** Verify that querying `trips` without a session returns an empty array, and saving a trip with an invalid `user_id` fails.
* **Trip Generation Route Handler Test (API):** Assert that `POST /api/generate` returns `400 Bad Request` when given empty or out-of-range payload parameters.

---

## Before Demo Checklist
- [ ] Complete the full journey: Sign in → Select 3D destination → Generate plan → Save → View in Dashboard.
- [ ] Hard refresh `/dashboard` to confirm Supabase data persistence.
- [ ] Submit the planning form with an empty destination to verify validation blocking.
- [ ] Open an incognito window and verify that direct navigation to `/dashboard` redirects to `/auth`.
- [ ] Test simulated API failure mode to verify that the template fallback button works smoothly.
- [ ] Verify that production environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) are active on Vercel and no `.env` files are tracked in Git.

---

## Known Limitations
* Live external hotel and flight prices are not real-time; budgets are estimated based on AI knowledge models.
* Multi-city itineraries with complex route optimization are not supported in the MVP (single destination hubs only).