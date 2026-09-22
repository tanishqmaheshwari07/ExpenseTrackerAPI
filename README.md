# 💰 Enterprise Expense Tracker REST API

A production-grade, enterprise-ready RESTful Expense Tracker API built with **Java 21, Spring Boot 3.4, Spring Security, Spring Data JPA, Flyway, PostgreSQL, Docker, and OpenAPI 3 / Swagger**.

---

## 🚀 Key Enterprise Features

### 🔐 Security & Authentication
- **Stateless JWT Authentication**: Secure HMAC-SHA token signing with customizable expiration.
- **Refresh Token Rotation**: Database-backed refresh token rotation with expiration and revocation checks.
- **Role-Based Authorization**: `ROLE_USER` and `ROLE_ADMIN` roles with method-level `@PreAuthorize` security.
- **CORS & Custom Error Handling**: Standardized JSON responses for 401 Unauthorized and 403 Forbidden.

### 📊 Financial Management & Analytics
- **Expense CRUD**: Full lifecycle management scoped to the authenticated user.
- **Auditing & Soft Deletes**: Automatic JPA auditing (`createdAt`, `updatedAt`, `version`) and Hibernate `@SQLDelete` / `@SQLRestriction` soft deletion.
- **Analytics & Summary**: Aggregated financial metrics (`/api/expenses/summary`) with date-range filters, category breakdowns, and monthly trends.
- **Pagination & Sorting**: Efficient database pagination wrapped with rich metadata (`PagedResponse<T>`).

### 📦 Database & Performance
- **Flyway Migrations**: Version-controlled DDL migrations (`V1__init_schema.sql`) preventing runtime schema drift.
- **Composite Indexing**: Optimized query paths for `(user_id, date)` and `(user_id, category)`.
- **HikariCP Connection Pool**: Production tuning for connection reuse and leak prevention.

### 📖 API Design & Observability
- **OpenAPI 3 / Swagger UI**: Interactive API documentation at `http://localhost:8080/swagger-ui.html` with JWT Bearer authentication.
- **Standardized Response Envelope**: Uniform `ApiResponse<T>` structure across all success and error responses.
- **Spring Boot Actuator & Prometheus**: Health checks (`/actuator/health`) and metrics scraping (`/actuator/prometheus`).

### 🐳 DevOps & CI/CD
- **Multi-Stage Dockerfile**: Builder stage with Maven + minimal Eclipse Temurin 21 JRE runtime running as non-root user.
- **Docker Compose**: Orchestrates Spring Boot API, PostgreSQL 16 with health checks, and Adminer GUI.
- **GitHub Actions**: Automated CI pipeline running tests and packaging artifacts on push/PR.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Language** | Java 21 |
| **Framework** | Spring Boot 3.4.3 |
| **Security** | Spring Security 6, JJWT 0.12.7 |
| **Database** | PostgreSQL 16 (H2 for tests) |
| **ORM / Migrations** | Hibernate, Spring Data JPA, Flyway |
| **Documentation** | SpringDoc OpenAPI 3 / Swagger UI |
| **Observability** | Spring Boot Actuator, Micrometer Prometheus |
| **DevOps** | Docker, Docker Compose, GitHub Actions |
| **Testing** | JUnit 5, Mockito, Spring Boot Test, MockMvc |

---

## 🏃 Quick Start

### 1. Run with Docker Compose (Recommended)
```bash
docker compose up --build
```
- **API**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **Actuator Health**: `http://localhost:8080/actuator/health`
- **Adminer DB GUI**: `http://localhost:8081`

### 2. Run Locally with Maven
```powershell
cd expensetracker
./mvnw clean test
./mvnw spring-boot:run
```

---

## 📑 API Endpoints Summary

### Authentication & User Management (`/api/users`)
- `POST /api/users/register` - Register a new user account
- `POST /api/users/login` - Authenticate credentials and receive access + refresh tokens
- `POST /api/users/refresh-token` - Rotate refresh token and get a new access token
- `GET /api/users/me` - Get current authenticated user profile
- `GET /api/users/{id}` - Get user by ID (own profile or admin)
- `PUT /api/users/{id}` - Update user profile
- `DELETE /api/users/{id}` - Delete user account

### Expense Management (`/api/expenses`)
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses` - Paginated expenses with optional `category`, `startDate`, and `endDate` filters
- `GET /api/expenses/{id}` - Get single expense by ID
- `PUT /api/expenses/{id}` - Update an existing expense
- `DELETE /api/expenses/{id}` - Soft-delete an expense
- `GET /api/expenses/my-expenses` - Retrieve all user expenses list
- `GET /api/expenses/summary` - Aggregated financial analytics & category breakdown
