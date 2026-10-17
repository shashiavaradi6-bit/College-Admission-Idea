# Campus Compass — Smart College Admission Finder

This repository starts a development foundation for an Indian college discovery product. **It is not a production-ready admissions service.** The workspace was empty when implementation began. The current deliverable is a responsive discovery experience, a small FastAPI demo API, and an initial Supabase schema.

## Current implementation

- Next.js App Router landing and discovery page with responsive filters, save interactions and source-status disclosures.
- FastAPI college listing/detail/course endpoints, exact-dimension historical-rank comparison, and a grounded NVIDIA admission assistant with explicit provider error states.
- A working `/chat` interface with conversation history, suggested questions, clear-chat behavior, response loading/error states, and visible context labels.
- Initial PostgreSQL migration with institutions, courses, historical cutoffs, student profile/preferences, saved colleges, applications, indexes, constraints, and owner-scoped RLS.
- Explicitly fictional demonstration records used only to preview interfaces. They are not official college data.
- Route shells for requested product paths; authentication, private student workflows, and admin operations remain disabled until their services and authorization are implemented.

## Requirements

- Node.js 20.9+ and npm (the npm CLI was not available to this setup session).
- Python 3.10+ (FastAPI's current dependency line requires a modern Python; this machine's visible Python 3.8 is too old).
- A Supabase project for Auth and PostgreSQL.
- Optional NVIDIA API key and a currently accessible NIM model name.

## Configure and run

1. Copy `.env.example` to `.env` and set Supabase URL/publishable key and database credentials. Keep service-role and NVIDIA keys server-side; never use them in `NEXT_PUBLIC_*` variables.
2. Apply `supabase/migrations/202610160001_initial_schema.sql` to the Supabase project using the Supabase CLI or SQL editor.
3. Install/run the API from `backend` with a supported Python: `python -m venv .venv`, activate it, `pip install -r requirements.txt`, then `uvicorn app.main:app --reload --port 8000 --env-file ../.env` (run from `backend` so the root `.env` is loaded).
4. Install/run the frontend from `frontend`: `npm install`, then `npm run dev`.
5. API docs are at `http://localhost:8000/docs`; frontend at `http://localhost:3000`.
6. API tests: from `backend`, `pytest`.

## API

- `GET /health`
- `GET /api/v1/colleges?q=&state=&course=&limit=&offset=`
- `GET /api/v1/colleges/{college_id}`
- `GET /api/v1/courses`
- `POST /api/v1/college-matches` with `rank`, `exam`, `year`, `category`, `quota`, `round`
- `POST /api/v1/chat` with `message`

A rank comparison is returned only when exam, year, category, quota and round match exactly. The tier is a historical comparison label, not a chance of admission. The included dataset is demonstrative; current seats, fees and deadlines are not represented as live.

## Environment

See `.env.example`. Supabase and NVIDIA are optional for local UI exploration. NVIDIA calls use the OpenAI-compatible hosted NIM endpoint and the configurable `NVIDIA_MODEL`; the default is `nvidia/nemotron-3.5-lightning-30b-a3b`. `/api/v1/ai/status` reports whether the backend has a key configured without returning the key. A live request was attempted on 2026-10-17: the configured model request timed out (`APITimeoutError`), so successful NVIDIA inference has not been verified from this machine. Check outbound network access, credential validity, model access, and NVIDIA quota if requests continue to fail.

## Limitations and next work

The initial migration is a foundation, not the complete normalized schema in the execution brief. The API currently serves in-memory demonstration colleges and does not connect SQLAlchemy to Supabase. Chat retrieval only uses those demonstration records; it is not connected to verified official college/cutoff data and cannot answer live availability, fees, eligibility or deadline questions as facts. Supabase Auth/session persistence, server-side authorization, full profile/onboarding persistence, saved-college/application CRUD, import review/audit pipeline, cutoff analytics, verified official records, and deadline workflows are not implemented. Most non-home routes remain explanatory shells. Do not collect actual student or sensitive eligibility information with this build. Set up service credentials and reviewed official datasets before extending or deploying it.

