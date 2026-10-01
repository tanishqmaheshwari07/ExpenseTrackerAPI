# Base44 Development Environment

## Project Overview
Fullstack expense tracker: Spring Boot 3.4.3 (Java 21) backend + React/Vite frontend + PostgreSQL 16.

## Architecture
- **Backend** (`expensetracker/`): Spring Boot REST API on port 8080, Maven build, Flyway migrations, JWT auth (stateless, Bearer token in localStorage — no cookies), JPA/Hibernate with soft deletes, Spring Security with CORS allowing all origins.
- **Frontend** (`frontend/`): React 18 + Vite 6 + TypeScript on port 3000, Tailwind CSS, TanStack Query, Zustand auth store, axios API client with automatic token refresh. API base URL configured via `VITE_API_BASE_URL` env var (defaults to `http://localhost:8080/api`).
- **Database**: PostgreSQL 16, credentials are local infra (postgres/postgres), Flyway runs automatically on startup with `baseline-on-migrate: true`.

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
- The frontend connects to the API at a separate origin (port 8080). CORS is already configured to allow all origins in `SecurityFilterConfig.java`.
- Vite config updated: `host: true` and `allowedHosts: true` to accept the preview's external hostname.
- `VITE_API_BASE_URL` is set in compose to `https://8080-${BASE44_PUBLIC_HOST_SUFFIX}/api` so the browser can reach the API through the public proxy.

## Verifying the App
1. `curl http://localhost:3000/` — should return HTML with Vite client scripts.
2. `curl http://localhost:8080/actuator/health` — should return `{"status":"UP"}`.
3. `POST http://localhost:8080/api/users/register` — should create a user and return JWT tokens.
