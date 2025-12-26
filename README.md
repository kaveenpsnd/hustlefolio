# Streak Blog Platform

A modular Spring Boot microservices-based blogging platform with JWT authentication, built using Java 17 and PostgreSQL.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Modules](#modules)
- [Database](#database)
- [Setup & Installation](#setup--installation)
- [API Endpoints](#api-endpoints)
- [Current Implementation Status](#current-implementation-status)
- [Next Steps](#next-steps)
- [Configuration](#configuration)

---

## 🎯 Project Overview

**Streak** is a multi-module Spring Boot application designed as a blogging platform with user authentication and authorization. The project follows a modular architecture separating concerns into distinct Maven modules for better maintainability and scalability.

**Project Name:** Streak Blog Platform  
**Version:** 1.0.0  
**Group ID:** com.streak  
**Build Tool:** Maven  
**Java Version:** 17  
**Spring Boot Version:** 3.2.0

---

## 🏗️ Architecture

The project follows a **modular monolith** architecture with the potential to evolve into microservices. It consists of three main modules:

1. **streak-common** - Shared utilities and common code
2. **streak-auth** - Authentication and user management module
3. **streak-app** - Main application module (entry point)

### Architecture Diagram

```
┌─────────────────────────────────────────┐
│         streak-app (Main App)           │
│  - Entry Point (StreakApplication)      │
│  - Health Check Controller              │
│  - Application Configuration            │
└───────────────┬─────────────────────────┘
                │
                │ depends on
                ↓
┌─────────────────────────────────────────┐
│         streak-auth (Auth Module)       │
│  - JWT Authentication                   │
│  - User Management                      │
│  - Login/Register Controllers           │
│  - Security Configuration               │
└───────────────┬─────────────────────────┘
                │
                │ depends on
                ↓
┌─────────────────────────────────────────┐
│      streak-common (Shared Module)      │
│  - Common DTOs                          │
│  - Shared Utilities                     │
│  - Common Entities (if any)             │
└─────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
- **Java:** 17
- **Spring Boot:** 3.2.0
- **Spring Framework:**
  - Spring Web (REST APIs)
  - Spring Data JPA (Database ORM)
  - Spring Security (Authentication & Authorization)
- **JWT:** JSON Web Token (JJWT 0.11.5)
- **Database:** PostgreSQL 15
- **Build Tool:** Maven
- **Utilities:**
  - Lombok 1.18.30 (Boilerplate reduction)

### DevOps & Infrastructure
- **Docker Compose:** For local development environment
- **PostgreSQL Docker Container:** Database containerization
- **Port Configuration:**
  - Application: `8080`
  - PostgreSQL: `5435` (mapped from container's 5432)

---

## 📁 Project Structure

```
Streak-Blog/
│
├── .git/                           # Git version control
├── .gitignore                      # Git ignore file
├── .idea/                          # IntelliJ IDEA project files
├── docker-compose.dev.yml          # Docker Compose for local PostgreSQL
│
├── pg-data-fresh/                  # Fresh PostgreSQL data volume
├── postgres-data/                  # PostgreSQL data volume (backup)
│
└── backend/                        # Main backend directory
    ├── pom.xml                     # Parent POM (multi-module project)
    │
    ├── streak-common/              # Common shared module
    │   ├── pom.xml
    │   └── src/
    │       └── main/
    │           └── java/
    │               └── (empty - ready for shared code)
    │
    ├── streak-auth/                # Authentication module
    │   ├── pom.xml
    │   ├── src/
    │   │   └── main/
    │   │       └── java/
    │   │           └── com/streak/auth/
    │   │               ├── config/
    │   │               │   └── AuthConfig.java          # Spring Security Config
    │   │               ├── controllers/
    │   │               │   └── AuthController.java      # Auth REST endpoints
    │   │               ├── dtos/
    │   │               │   ├── LoginRequest.java        # Login DTO
    │   │               │   └── RegisterRequest.java     # Register DTO
    │   │               ├── repositories/
    │   │               │   └── UserRepository.java      # JPA User Repository
    │   │               ├── service/
    │   │               │   └── AuthService.java         # Auth business logic
    │   │               ├── utils/
    │   │               │   └── JwtUtil.java             # JWT utility (INCOMPLETE)
    │   │               └── User.java                    # User entity
    │   └── target/                                      # Build artifacts
    │
    └── streak-app/                 # Main application module
        ├── pom.xml
        ├── src/
        │   └── main/
        │       ├── java/
        │       │   └── com/streak/
        │       │       ├── StreakApplication.java       # Main entry point
        │       │       └── controllers/
        │       │           └── healthController.java    # Health check endpoint
        │       └── resources/
        │           └── application.yml                  # Application configuration
        └── target/                                      # Build artifacts
```

---

## 📦 Modules

### 1. `streak-common`
**Purpose:** Shared utilities, common DTOs, and reusable code across modules.

**Dependencies:**
- Lombok

**Current Status:** Empty module ready for shared components.

**Package:** `com.streak.common` (when implemented)

---

### 2. `streak-auth`
**Purpose:** Handles all authentication and authorization concerns including user registration, login, and JWT token management.

**Dependencies:**
- streak-common
- Spring Data JPA
- Spring Security
- JJWT (JWT library)
- Lombok

**Key Components:**

#### 📄 `User.java` - User Entity
```java
@Entity
@Table(name = "users")
```
**Fields:**
- `id` (Long, auto-generated)
- `username` (String, unique, non-null)
- `email` (String, unique, non-null)
- `password` (String, non-null, BCrypt encrypted)
- `createdAt` (LocalDateTime)

#### 📄 `UserRepository.java` - Data Access Layer
**Methods:**
- `findByUsername(String username): Optional<User>`
- `existsByUsername(String username): boolean`
- `existsByEmail(String email): boolean`

#### 📄 `AuthService.java` - Business Logic
**Methods:**
- `register(username, email, rawPassword)`: Creates new user with encrypted password
- `login(username, rawPassword)`: Authenticates user and returns User object

**Validation:**
- Checks for duplicate usernames and emails
- Encrypts passwords using BCryptPasswordEncoder
- Validates credentials during login

#### 📄 `AuthController.java` - REST API
**Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**Request Bodies:**
- `RegisterRequest`: `{username, email, password}`
- `LoginRequest`: `{username, password}`

#### 📄 `AuthConfig.java` - Security Configuration
**Security Settings:**
- CSRF: Disabled (REST API)
- Form Login: Disabled
- HTTP Basic: Disabled
- Session Management: STATELESS
- Public Endpoints: `/api/ping`, `/api/auth/**`, `/error`
- All other endpoints: Require authentication

#### 📄 `JwtUtil.java` - JWT Utility (✅ COMPLETE)
**Current State:**
- SECRET_KEY defined (256-bit hex-encoded)
- Using JJWT 0.11.5 API (modern, non-deprecated)
- **Implemented Methods:**
  - `generateToken(username)` - Generates JWT with 10-hour validity
  - `validateToken(token, username)` - Validates token and checks expiration
  - `extractUsername(token)` - Extracts username from token
  - `extractExpiration(token)` - Gets token expiration date
  - `isTokenExpired(token)` - Checks if token is expired
  - `extractClaim(token, resolver)` - Generic claim extractor
  - `getSigningKey()` - Generates SecretKey from BASE64 secret

---

### 3. `streak-app`
**Purpose:** Main application entry point that orchestrates all modules.

**Dependencies:**
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- streak-common
- streak-auth

**Key Components:**

#### 📄 `StreakApplication.java` - Entry Point
```java
@SpringBootApplication(scanBasePackages = {
    "com.streak",
    "com.streak.auth"
})
```
**Features:**
- Component scanning across all modules
- Application startup configuration

#### 📄 `healthController.java` - Health Check
**Endpoint:**
- `GET /ping` → Returns "Pong! Streak Platform is running."

**Purpose:** Simple endpoint to verify application status.

---

## 🗄️ Database

### PostgreSQL Configuration

**Database Details:**
- **Engine:** PostgreSQL 15 Alpine
- **Container Name:** streak_local_db
- **Database Name:** streak_db
- **Username:** streak_dev
- **Password:** password
- **Host Port:** 5435
- **Container Port:** 5432
- **Volume:** ./pg-data-fresh

### Database Schema

#### `users` Table
| Column     | Type          | Constraints                    |
|------------|---------------|--------------------------------|
| id         | BIGSERIAL     | PRIMARY KEY                    |
| username   | VARCHAR       | NOT NULL, UNIQUE               |
| email      | VARCHAR       | NOT NULL, UNIQUE               |
| password   | VARCHAR       | NOT NULL (BCrypt encrypted)    |
| created_at | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP      |

**Hibernate DDL:** `update` mode (auto-creates/updates schema)

---

## 🚀 Setup & Installation

### Prerequisites
- **Java 17** or higher
- **Maven 3.6+**
- **Docker & Docker Compose**
- **Git**

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd Streak-Blog
```

#### 2. Start PostgreSQL Database
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Verify database is running:**
```bash
docker ps
```
You should see `streak_local_db` container running.

#### 3. Build the Project
Navigate to the backend directory:
```bash
cd backend
mvn clean install
```

This will:
- Build all modules (streak-common, streak-auth, streak-app)
- Run tests
- Package the application

#### 4. Run the Application
```bash
cd streak-app
mvn spring-boot:run
```

**Alternative:** Run from your IDE
- Open `StreakApplication.java`
- Run the main method

#### 5. Verify Application
Open browser or use curl:
```bash
curl http://localhost:8080/ping
```

Expected response: `Pong! Streak Platform is running.`

---

## 🔌 API Endpoints

### Public Endpoints (No Authentication Required)

#### Health Check
```http
GET /ping
```
**Response:** `200 OK`
```
Pong! Streak Platform is running.
```

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response:** `200 OK`
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "password": "$2a$10$...(bcrypt hash)",
  "createdAt": "2025-12-17T10:30:00"
}
```

**Error Responses:**
- `500 Internal Server Error` - Username already exists
- `500 Internal Server Error` - Email already exists

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Success Response:** `200 OK`
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "password": "$2a$10$...",
  "createdAt": "2025-12-17T10:30:00"
}
```

**Error Responses:**
- `500 Internal Server Error` - User not found
- `500 Internal Server Error` - Invalid password

### Protected Endpoints (Authentication Required)
**Status:** No protected endpoints implemented yet.

**Note:** `/error` is accessible without authentication for Spring Boot error handling.

---

## ✅ Current Implementation Status

### ✔️ Completed Features

1. **Project Structure**
   - Multi-module Maven project setup
   - Module dependencies configured correctly
   - Package structure organized

2. **Database Integration**
   - PostgreSQL container setup with Docker Compose
   - JPA entity configuration
   - Repository layer implemented
   - Database connection configured

3. **User Management**
   - User entity with proper validation
   - User repository with custom queries
   - BCrypt password encryption

4. **Authentication Service**
   - User registration with duplicate checking
   - User login with password validation
   - Password encoding/decoding

5. **REST API**
   - Registration endpoint
   - Login endpoint
   - Health check endpoint

6. **Security Configuration**
   - Spring Security configured
   - CSRF disabled for REST API
   - Stateless session management
   - Public/protected endpoint configuration

### ⚠️ Incomplete Features

1. **JWT Integration** (CRITICAL - Partially Complete)
   - ✅ `JwtUtil.java` is complete with all methods
   - ❌ No token generation on login (AuthService needs update)
   - ❌ No token validation filter
   - ❌ No JWT filter for request authentication

2. **Response DTOs**
   - Login/Register should return JWT tokens, not User objects
   - Need `AuthResponse` DTO with token field
   - Password should never be returned in responses

3. **Error Handling**
   - No global exception handler
   - Using generic RuntimeException
   - Need custom exceptions (UserNotFoundException, DuplicateUserException, etc.)

4. **JWT Request Filter**
   - No filter to intercept requests and validate JWT
   - Protected endpoints won't work without this

5. **User Details Service**
   - Need custom UserDetailsService implementation
   - Required for Spring Security integration

6. **API Documentation**
   - No Swagger/OpenAPI documentation

7. **Testing**
   - No unit tests
   - No integration tests

8. **Validation**
   - No input validation on DTOs (@Valid, @NotBlank, etc.)
   - No email format validation
   - No password strength requirements

---

## 🔜 Next Steps

### Priority 1: Complete JWT Authentication (CRITICAL)

#### 1. Complete `JwtUtil.java`
Add the following methods:

```java
// Generate JWT token
public String generateToken(String username)

// Validate token
public boolean validateToken(String token, String username)

// Extract username from token
public String extractUsername(String token)

// Extract expiration date
public Date extractExpiration(String token)

// Check if token is expired
private boolean isTokenExpired(String token)

// Extract claims
private Claims extractAllClaims(String token)

// Get signing key
private Key getSigningKey()
```

**Token Configuration:**
- Expiration: 24 hours (or configurable)
- Algorithm: HS256
- Claims: username, issued at, expiration

#### 2. Create `AuthResponse` DTO
```java
@Data
public class AuthResponse {
    private String token;
    private String username;
    private String email;
}
```

#### 3. Update `AuthService`
Modify methods to generate JWT tokens:
- `register()` should return token
- `login()` should return token

#### 4. Create `JwtRequestFilter`
- Extend `OncePerRequestFilter`
- Extract JWT from Authorization header
- Validate token
- Set authentication in SecurityContext

#### 5. Update `AuthConfig`
- Add JWT filter to security chain
- Configure filter order

#### 6. Implement `CustomUserDetailsService`
- Implement `UserDetailsService`
- Load user from database
- Return `UserDetails` implementation

### Priority 2: Improve Error Handling

1. Create custom exceptions:
   - `UserNotFoundException`
   - `DuplicateUserException`
   - `InvalidCredentialsException`
   - `InvalidTokenException`

2. Create `GlobalExceptionHandler` with `@ControllerAdvice`

3. Define error response structure:
```java
@Data
public class ErrorResponse {
    private String message;
    private int status;
    private LocalDateTime timestamp;
}
```

### Priority 3: Security Improvements

1. Move SECRET_KEY to `application.yml`
2. Add input validation annotations
3. Implement password strength validation
4. Add email format validation
5. Don't return password in any response
6. Add rate limiting for auth endpoints

### Priority 4: Testing

1. Add JUnit 5 and Mockito dependencies
2. Write unit tests for:
   - `AuthService`
   - `JwtUtil`
   - `AuthController`
3. Write integration tests for auth flow

### Priority 5: Blog Features

Once authentication is solid, implement:
1. Post entity and repository
2. Post CRUD operations
3. User-Post relationships
4. Categories/Tags
5. Comments
6. Search functionality

---

## ⚙️ Configuration

### `application.yml`

```yaml
server:
  port: 8080

spring:
  application:
    name: streak-platform

  datasource:
    url: jdbc:postgresql://localhost:5435/streak_db
    username: streak_dev
    password: password
    driver-class-name: org.postgresql.Driver

  jpa:
    database: POSTGRESQL
    show-sql: true
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

### Recommended Additional Configuration

```yaml
# JWT Configuration (TO BE ADDED)
jwt:
  secret: ${JWT_SECRET:your-secret-key-here}
  expiration: 86400000  # 24 hours in milliseconds
  
# Logging
logging:
  level:
    com.streak: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
    
# Server error handling
server:
  error:
    include-message: always
    include-binding-errors: always
```

---

## 🔐 Security Notes

### Current Security Issues

1. **SECRET_KEY Hardcoded:** Move to environment variables
2. **No Token Expiration:** Implement token refresh mechanism
3. **Password in Response:** Never return password field
4. **No Input Validation:** Add validation annotations
5. **Generic Error Messages:** Don't expose internal errors
6. **No Rate Limiting:** Add rate limiting for auth endpoints

### Recommended Improvements

1. **Use environment variables:**
   ```bash
   export JWT_SECRET=your-production-secret-key
   export DB_PASSWORD=secure-db-password
   ```

2. **Add validation:**
   ```java
   @NotBlank(message = "Username is required")
   @Size(min = 3, max = 20)
   private String username;
   ```

3. **Implement refresh tokens** for better security

4. **Add CORS configuration** for frontend integration

5. **Enable HTTPS** in production

---

## 🧪 Testing

### Manual Testing with curl

#### Register a User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

#### Health Check
```bash
curl http://localhost:8080/ping
```

---

## 🐛 Known Issues

1. **JWT Not Implemented:** Login returns user object instead of JWT token
2. **No Protected Routes:** All endpoints except auth are currently inaccessible
3. **Password Exposed:** User password hash is returned in responses
4. **Poor Error Handling:** Generic RuntimeException messages
5. **No Validation:** No input validation on request bodies
5. **No Input Validation:** No input validation on request bodies

---

## 📚 Dependencies

### Parent POM (`backend/pom.xml`)
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<properties>
    <java.version>17</java.version>
    <lombok.version>1.18.30</lombok.version>
</properties>
```

### streak-auth Module
```xml
<dependencies>
    <!-- Internal -->
    <dependency>
        <groupId>com.streak</groupId>
        <artifactId>streak-common</artifactId>
        <version>1.0.0</version>
    </dependency>
    
    <!-- Spring -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- JJWT (JWT Library) -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Utils -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### streak-app Module
```xml
<dependencies>
    <!-- Internal -->
    <dependency>
        <groupId>com.streak</groupId>
        <artifactId>streak-common</artifactId>
        <version>1.0.0</version>
    </dependency>
    <dependency>
        <groupId>com.streak</groupId>
        <artifactId>streak-auth</artifactId>
        <version>1.0.0</version>
    </dependency>
    
    <!-- Spring -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

---

## 🤝 Development Guidelines

### Code Style
- Use Lombok annotations to reduce boilerplate
- Follow Spring Boot best practices
- Package by feature (not by layer)
- Use meaningful variable and method names

### Git Workflow
- Use feature branches
- Write descriptive commit messages
- Don't commit target/ directories
- Keep .gitignore updated

### Database
- Always use migrations in production (add Flyway/Liquibase)
- Never use `ddl-auto: create` or `create-drop` in production
- Use `ddl-auto: validate` in production

---

## 📞 Context for LLM Continuation

**Situation:** This project was guided by Gemini LLM and the chat was deleted. Development needs to continue from the current state.

**Current State Summary:**
- Multi-module Spring Boot application with basic structure
- User registration and login API implemented
- Database integration working
- Spring Security configured
- **JWT token generation and validation NOT IMPLEMENTED**
- No proper error handling or validation

**Immediate Priority:**
Complete the JWT authentication flow by implementing `JwtUtil` methods, creating JWT filter, and modifying auth responses to return tokens instead of user objects.

**Prompt to Continue with New LLM:**
> "I have a Spring Boot 3.2.0 multi-module project for a blog platform. The authentication module is partially complete with user registration/login, but JWT token generation is not implemented. The `JwtUtil` class has only the SECRET_KEY defined. I need to:
> 1. Complete the JWT token generation and validation
> 2. Create a JWT filter for request authentication  
> 3. Modify login/register to return JWT tokens
> 4. Add proper error handling
> 
> Please help me complete the JWT implementation step by step."

---

## 📝 License

*[Add your license information here]*

---

## 👥 Contributors

*[Add contributor information here]*

---

**Last Updated:** December 17, 2025  
**Project Status:** In Development (Authentication Phase)  
**Completion:** ~40% (Core structure ready, JWT implementation pending)

