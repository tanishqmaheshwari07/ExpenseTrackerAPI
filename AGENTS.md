# ExpenseTracker Development Environment

## Project Overview
Fullstack expense tracker: Spring Boot 3.4.3 (Java 21) backend + React/Vite frontend + PostgreSQL 16.

## Architecture
- **Backend** (`expensetracker/`): Spring Boot REST API on port 8080, Maven build, Flyway migrations, JWT auth with HttpOnly refresh token cookies, access token kept in-memory on the client, Spring Security with CORS configured for localhost origins only.
- **Frontend** (`frontend/`): React 18 + Vite 6 + TypeScript on port 3000, Tailwind CSS, TanStack Query, Zustand auth store (access token in-memory, user profile in localStorage), axios client with `withCredentials: true` for cookie-based refresh tokens.
- **Database**: PostgreSQL 16, credentials are local infrastructure (postgres/postgres), Flyway runs automatically on startup with `baseline-on-migrate: true`.

## Single-Origin Proxy (Important)
The app uses HttpOnly cookies for refresh tokens, so the development environment uses a **single-origin** wiring: Vite's dev server proxies `/api` requests to the backend (`http://api:8080`). This means:
- The browser sees all requests as same-origin (port 3000), so cookies work without SameSite/CORS issues.
- `VITE_API_BASE_URL` is set to `/api` (relative URL).
- The backend's CORS config (localhost-only) is not involved because the proxy makes internal Docker network requests.
- Port 8080 is also exposed for direct API/Swagger access, but the frontend always goes through the proxy.

## Running the App

```bash
docker compose up -d