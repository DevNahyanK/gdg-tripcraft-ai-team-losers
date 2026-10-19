# API Contract: TripCraft AI MVP

> Document only endpoints required by the MVP workflow. Keep examples strictly aligned with SRD.md and DATA_MODEL.md.

Base path: `/api/v1`

## `POST /trips/generate`
Generate a structured, multi-day itinerary and estimated budget using Gemini AI. Can be called by guests or signed-in users.

Request:
```json
{
  "destination": "Hunza Valley",
  "durationDays": 4,
  "budgetTier": "moderate",
  "interests": ["nature", "food"]
}