# 💰 Expense Tracker API

A production-oriented RESTful Expense Tracker API built with **Java, Spring Boot, Spring Data JPA, PostgreSQL, and REST APIs**.

The project demonstrates backend development concepts such as CRUD operations, layered architecture, DTOs, validation, exception handling, authentication, database relationships, custom queries, pagination, testing, and deployment.

---

## 🚀 Features

### Expense Management
- Create an expense
- Get all expenses
- Get expense by ID
- Update an expense
- Delete an expense
- Categorize expenses
- Track expense dates
- Validate expense data

### Advanced Features
- DTO-based request and response handling
- Global exception handling
- Custom validation messages
- Category-wise expense filtering
- Date-based expense filtering
- Monthly expense summaries
- Total expense calculation
- Pagination and sorting
- Custom JPA queries
- Database relationships
- User-specific expenses

### Security
- User registration
- User login
- Password encryption
- JWT-based authentication
- Protected API endpoints
- Role-based authorization

### Production Features
- Centralized exception handling
- Proper HTTP status codes
- Request validation
- Clean layered architecture
- Unit testing
- Integration testing
- API documentation
- Docker support
- Environment-based configuration
- Cloud deployment

---

## 🛠️ Tech Stack

### Backend
- Java
- Spring Boot
- Spring MVC
- Spring Data JPA
- Hibernate
- Maven

### Database
- PostgreSQL

### Security
- Spring Security
- JWT
- BCrypt

### Testing
- JUnit
- Mockito
- Spring Boot Test

### API Testing
- Postman

### DevOps
- Docker
- Git
- GitHub
- Cloud Deployment

---

## 🏗️ Architecture

The application follows a layered architecture:

```text
Client
   │
   ▼
Controller
   │
   ▼
DTO
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
PostgreSQL
