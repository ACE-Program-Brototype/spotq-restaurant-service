# 🍽️ SpotQ Restaurant Service

Restaurant Service is one of the core backend microservices of the SpotQ platform. It provides the foundational infrastructure required for implementing restaurant-related business features while following the SpotQ engineering standards for scalability, security, observability, and maintainability.

> **Status:** Foundation Completed ✅

---

# Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Implemented Foundation](#implemented-foundation)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Infisical Configuration](#infisical-configuration)
- [Available Scripts](#available-scripts)
- [Docker](#docker)
- [Health Endpoints](#health-endpoints)
- [Observability](#observability)
- [Project Architecture](#project-architecture)
- [Branching Strategy](#branching-strategy)
- [Coding Standards](#coding-standards)
- [CI Pipeline](#ci-pipeline)
- [Development Guidelines](#development-guidelines)
- [Future Enhancements](#future-enhancements)

---

# Overview

The Restaurant Service is responsible for managing restaurant-related functionality within the SpotQ ecosystem.

The current implementation provides only the service foundation and infrastructure.

Implemented:

- Express Application
- Clean Architecture
- TypeScript
- Prisma Configuration
- PostgreSQL Connection
- Redis Connection
- BullMQ Foundation
- Structured Logging
- Prometheus Metrics
- Health Checks
- Docker Support
- Infisical Secret Management

Not yet implemented:

- Restaurant APIs
- Business Logic
- Authentication
- Authorization
- Event Publishing
- gRPC
- Domain Models

---

# Technology Stack

| Technology | Purpose |
|------------|----------|
| Node.js 22 | Runtime |
| Express.js | HTTP Server |
| TypeScript | Language |
| Prisma | ORM |
| PostgreSQL | Database |
| Redis | Cache & Queue Backend |
| BullMQ | Queue Infrastructure |
| Pino | Structured Logging |
| Prometheus | Metrics |
| Biome | Linting & Formatting |
| pnpm | Package Manager |
| Docker | Containerization |
| Infisical | Secrets Management |
| GitHub Actions | Continuous Integration |

---

# Project Structure

```text
src/
│
├── application/
│
├── domain/
│
├── infrastructure/
│   ├── database/
│   ├── queue/
│   ├── observability/
│   └── logging/
│
├── presentation/
│   ├── middleware/
│   └── routes/
│
├── shared/
│
├── config/
│
├── app.ts
└── server.ts
```

---

# Implemented Foundation

## Configuration

- Infisical Integration
- Environment Validation
- Shared Constants
- Application Configuration

---

## Database

- Prisma ORM
- PostgreSQL Connection
- Reusable Prisma Client
- Database Connection Service

---

## Redis

- Redis Cloud Integration
- Reusable Redis Client
- Connection Verification

---

## Queue

- BullMQ Configuration
- Shared Queue Connection
- Redis-backed Queue Infrastructure

---

## Logging

Structured JSON logging using Pino.

Includes:

- Timestamp
- Log Level
- Service Name
- Request Logging
- Response Logging
- Error Logging

---

## Metrics

Prometheus-compatible metrics.

Available metrics include:

- HTTP Request Count
- HTTP Request Duration
- HTTP Error Count
- Node.js Runtime Metrics
- CPU Metrics
- Memory Metrics
- Process Metrics

Endpoint:

GET /

```text
GET /metrics
```

---


# Prerequisites

Install:

- Node.js 22+
- pnpm
- Docker Desktop
- Git
- Infisical CLI

Verify:

```bash
node -v
pnpm -v
docker --version
infisical --version
```

---

# Local Development Setup

Clone repository

```bash
git clone <repository-url>

cd spotq-restaurant-service
```

Install dependencies

```bash
pnpm install
```

Start development server

```bash
infisical run -- pnpm dev
```

Build project

```bash
pnpm build
```

Run production build

```bash
node dist/server.js
```

---

# Infisical Configuration

Login

```bash
infisical login
```

Initialize

```bash
infisical init
```

Run application

```bash
infisical run -- pnpm dev
```

Required secrets

| Variable | Description |
|-----------|-------------|
| PORT | Application Port |
| DATABASE_URL | PostgreSQL Connection |
| REDIS_URL | Redis Connection |
| APP_ENV | Environment |

---

# Available Scripts

Install

```bash
pnpm install
```

Development

```bash
pnpm dev
```

Build

```bash
pnpm build
```

Start

```bash
pnpm start
```

Lint

```bash
pnpm lint
```

Format

```bash
pnpm format
```

Check

```bash
pnpm check
```

Test

```bash
pnpm test
```

---

# Docker

Build image

```bash
docker build -t spotq-restaurant-service .
```

Set Infisical token

PowerShell

```powershell
$env:INFISICAL_TOKEN="<YOUR_INFISICAL_TOKEN>"
```

Run container

```powershell
docker run --rm `
-p 3000:3000 `
-e INFISICAL_TOKEN `
-e INFISICAL_ENV=dev `
spotq-restaurant-service
```

Application

```
http://localhost:3000
```

Metrics

```
http://localhost:3000/metrics
```

---

# Observability

## Logging

Structured logs are written to stdout.

Example

```json
{
  "level": "INFO",
  "message": "Incoming Request",
  "method": "GET",
  "route": "/health",
  "status": 200
}
```

---

## Metrics

Prometheus endpoint

```text
GET /metrics
```

Collected metrics

- HTTP Requests
- Request Duration
- HTTP Errors
- CPU Usage
- Memory Usage
- Heap Usage
- Event Loop Metrics
- Process Metrics

---

# Project Architecture

This project follows **Clean Architecture**.

```text
Presentation
        │
        ▼
Application
        │
        ▼
Domain
        │
        ▼
Infrastructure
```

Responsibilities

Presentation

- HTTP Layer
- Middleware
- Controllers

Application

- Business Use Cases

Domain

- Entities
- Business Rules

Infrastructure

- Database
- Redis
- Queue
- External Services

---

# Branching Strategy

Permanent branches

```
main
staging
development
```

Working branches

```
feat/<feature>

fix/<issue>

refactor/<module>

docs/<topic>

chore/<task>

hotfix/<issue>
```

---

# Coding Standards

Follow:

- Clean Architecture
- SOLID Principles
- TypeScript Strict Mode
- Biome Formatting
- Structured Logging
- Prometheus Metrics
- Conventional Git Commits

---

# CI Pipeline

GitHub Actions executes:

- Install Dependencies
- Run Linter
- Execute Tests
- Build Application
- Build Docker Image

Triggered on

- Pull Request
- development
- staging
- main

---

# Development Guidelines

Before creating a Pull Request

Run

```bash
pnpm lint
```

```bash
pnpm check
```

```bash
pnpm build
```

Verify

- Application Endpoint
- Metrics Endpoint

Ensure Docker builds successfully.

---

# Future Enhancements

Upcoming implementations include

- Restaurant Domain
- Authentication
- Authorization
- Restaurant CRUD
- Menu Management
- Staff Management
- Event Publishing
- Queue Workers
- Unit Testing
- Integration Testing
- Kubernetes Deployment
- Helm Charts
- Grafana Dashboards
- Distributed Tracing
- OpenTelemetry

---

# License

This project is part of the **SpotQ Platform** and follows the internal engineering standards defined by the SpotQ Backend Architecture.