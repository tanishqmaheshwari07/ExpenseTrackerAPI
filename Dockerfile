# =============================================================================
# Stage 1: Build the Spring Boot application using Maven
# =============================================================================
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY expensetracker/pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY expensetracker/src ./src
RUN mvn clean package -DskipTests

# =============================================================================
# Stage 2: Production JRE runtime image (minimal attack surface)
# =============================================================================
FROM eclipse-temurin:21-jre-alpine

# Add non-root system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy built artifact from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
