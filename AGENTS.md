# Base44 Development Environment

## Project Overview
Fullstack expense tracker: Spring Boot 3.4.3 (Java 21) backend + React/Vite frontend + PostgreSQL 16.

## Architecture
- **Backend** (`expensetracker/`): Spring Boot REST API on port 8080, Maven build, Flyway migrations, JWT auth with HttpOnly refresh token cookies, access token kept in-memory on the client, Spring Security with CORS configured for localhost origins only.
- **Frontend** (`frontend/`): React 18 + Vite 6 + TypeScript on port 3000, Tailwind CSS, TanStack Query, Zustand auth store (access token in-memory, user profile in localStorage), axios client with `withCredentials: true` for cookie-based refresh tokens.
- **Database**: PostgreSQL 16, credentials are local infra (postgres/postgres), Flyway runs automatically on startup with `baseline-on-migrate: true`.

## Single-Origin Proxy (Important)
The app uses HttpOnly cookies for refresh tokens, so the preview uses a **single-origin** wiring: Vite's dev server proxies `/api` requests to the backend (`http://api:8080`). This means:
- The browser sees all requests as same-origin (port 3000), so cookies work without SameSite/CORS issues.
- `VITE_API_BASE_URL` is set to `/api` (relative URL).
- The backend's CORS config (localhost-only) is not involved because the proxy makes internal Docker network requests.
- Port 8080 is also exposed for direct API/Swagger access, but the frontend always goes through the proxy.

## Running the App
```bash
docker compose -f docker-compose.base44.yml up -d
```
- Frontend: http://localhost:3000
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

## Key Details
- The backend runs from source via `mvn spring-boot:run` (not a prebuilt jar). Maven dependencies are cached in a named volume (`maven-cache`). First boot takes several minutes for dependency download; subsequent boots are fast.
- The frontend runs Vite dev server with HMR. `node_modules` is in a named volume (`frontend-node-modules`).
- No external secrets required. JWT secret has a default in `application.yml`. DB credentials are local infra set via compose `environment:`.
- Vite config: `host: true` and `allowedHosts: true` to accept the preview's external hostname. Proxy config forwards `/api` to the backend container.
- Frontend healthcheck uses `127.0.0.1` (not `localhost`) because Vite binds to IPv4 only.

## Verifying the App
1. `curl http://localhost:3000/` — should return HTML with Vite client scripts.
2. `curl http://localhost:8080/actuator/health` — should return `{"status":"UP"}`.
3. `POST http://localhost:8080/api/users/register` — should create a user and return JWT tokens + Set-Cookie header.
