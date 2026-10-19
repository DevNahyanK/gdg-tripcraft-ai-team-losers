# Data Model: TripCraft AI MVP

> Relational PostgreSQL schema reference for Supabase. Designed strictly around the MVP scope: User auth, 3D destination selection, AI itinerary generation, budget calculation, and dashboard persistence.

---

## `profiles`
Links directly to Supabase internal `auth.users` to manage user identity and profile metadata.

| Field | Type | Constraints / Allowed | Notes |
|---|---|---|---|
| `id` | `uuid` | Primary Key, references `auth.users(id)` on delete cascade | Matches Supabase Auth user ID |
| `email` | `text` | Unique, not null | Managed by Supabase Auth |
| `full_name` | `text` | Nullable | User display name |
| `avatar_url` | `text` | Nullable | OAuth provider profile picture |
| `created_at` | `timestamptz` | Not null, default `now()` | Account registration timestamp |

---

## `trips`
Represents an itinerary container generated for a destination.

| Field | Type | Constraints / Allowed | Notes |
|---|---|---|---|
| `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Unique trip identifier |
| `user_id` | `uuid` | Foreign Key → `profiles(id)` on delete cascade, not null | Owner of the trip |
| `destination` | `text` | Not null, length 1–100 chars | Name of city/region (e.g., "Hunza Valley") |
| `latitude` | `numeric(9,6)` | Nullable | Pin coordinates for 3D globe focus |
| `longitude` | `numeric(9,6)` | Nullable | Pin coordinates for 3D globe focus |
| `duration_days` | `integer` | Not null, check: `duration_days BETWEEN 1 AND 7` | Length of trip in days |
| `budget_tier` | `text` | Not null, check: in `('budget', 'moderate', 'luxury')` | User-selected spending preference |
| `total_estimated_cost` | `numeric(10,2)` | Not null, default `0.00` | Aggregated AI estimated trip cost |
| `currency` | `text` | Not null, default `'PKR'` | ISO currency code or label |
| `created_at` | `timestamptz` | Not null, default `now()` | Generation timestamp |
| `updated_at` | `timestamptz` | Not null, default `now()` | Last modified timestamp |

---

## `itinerary_days`
Represents each individual day within a trip schedule.

| Field | Type | Constraints / Allowed | Notes |
|---|---|---|---|
| `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Unique day record identifier |
| `trip_id` | `uuid` | Foreign Key → `trips(id)` on delete cascade, not null | Parent trip reference |
| `day_number` | `integer` | Not null, check: `day_number >= 1` | Sequential day sequence (Day 1, Day 2, etc.) |
| `theme` | `text` | Nullable, max 100 chars | Day focus (e.g., "Historical Forts & Local Bazaars") |
| `created_at` | `timestamptz` | Not null, default `now()` | Record creation timestamp |

---

## `activities`
Represents specific scheduled stops, sights, or meals within a day.

| Field | Type | Constraints / Allowed | Notes |
|---|---|---|---|
| `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Activity record identifier |
| `day_id` | `uuid` | Foreign Key → `itinerary_days(id)` on delete cascade, not null | Parent itinerary day reference |
| `time_slot` | `text` | Not null, check: in `('morning', 'afternoon', 'evening')` | Time block of day |
| `title` | `text` | Not null, length 1–150 chars | Name of place or activity |
| `description` | `text` | Nullable | Brief overview, tips, or highlights |
| `location_name` | `text` | Nullable | Specific spot or neighborhood |
| `estimated_cost` | `numeric(10,2)` | Not null, default `0.00` | Estimated activity expense |
| `category` | `text` | Nullable, in `('sightseeing', 'food', 'travel', 'leisure')` | Visual icon categorization |
| `order_index` | `integer` | Not null, default `0` | Order within the time slot |

---

## `budget_summaries`
Stores itemized cost breakdowns calculated by the AI engine for the trip.

| Field | Type | Constraints / Allowed | Notes |
|---|---|---|---|
| `id` | `uuid` | Primary Key, default `gen_random_uuid()` | Unique record identifier |
| `trip_id` | `uuid` | Foreign Key → `trips(id)` on delete cascade, not null, unique | One-to-one with `trips` |
| `accommodation_cost` | `numeric(10,2)` | Not null, default `0.00` | Estimated lodging expenditure |
| `food_cost` | `numeric(10,2)` | Not null, default `0.00` | Estimated meals & dining expenditure |
| `transport_cost` | `numeric(10,2)` | Not null, default `0.00` | Estimated transit & fuel expenditure |
| `activities_cost` | `numeric(10,2)` | Not null, default `0.00` | Estimated entrance fees & tours |
| `misc_cost` | `numeric(10,2)` | Not null, default `0.00` | Emergency buffer expenditure |

---

## Security & Row-Level Policies (RLS)
* **Default Deny:** Row Level Security (RLS) is enabled on all tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
* **Tenant Isolation:** Users can only view, create, update, or delete records where `trips.user_id = auth.uid()`.
* **Cascading Authorization:** Child tables (`itinerary_days`, `activities`, `budget_summaries`) authorize access by verifying that the linked `trip_id` belongs to the requesting user (`trips.user_id = auth.uid()`).
* **Server-Role Operations:** Service role key is restricted to backend route handlers for batch insert operations during AI generation flows.