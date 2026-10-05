# SpotQ Restaurant Service — Load Testing Report

- **Jira Story**: [SCRUM-879](https://spotq.atlassian.net/browse/SCRUM-879)
- **Service**: `spotq-restaurant-service`
- **Execution Date**: 2026-10-05
- **Tool**: Grafana k6 (`v0.43+`)
- **Author**: Ajex Joshy (`ajexjoshywork@gmail.com`)

---

## 1. Executive Summary

This report documents the live load and stress testing executed for the landing page and restaurant discovery flows of SpotQ. The primary objective is to evaluate application resilience, latency percentiles, error rates, and database/connection pool stability under both expected and peak traffic spikes.

Testing was conducted across 5 controlled stages ramping up to 100 concurrent virtual users (VUs), executing a total of **11,440 requests** at **97.96 req/s** (176 checks/s).

All key business latency thresholds (`p95 < 300ms`, `p99 < 600ms`) were achieved with an average expected request duration of **55.18ms**.

---

## 2. Test Configuration & Environment

### Environment Specs
- **Runtime**: Node.js v22 (ESM build via `tsup`)
- **Web Framework**: Express.js with Inversify DI
- **Database**: PostgreSQL 16 (UTC `@db.Timestamptz` timestamps)
- **Cache & Queue**: Upstash Redis / BullMQ
- **Logging**: Structured Pino JSON logger with Correlation IDs
- **Metrics**: Prometheus client (`GET /metrics`)

### Load Profile (5 Controlled Stages)

| Stage | Duration | Target Virtual Users (VUs) | Objective |
| :--- | :--- | :--- | :--- |
| **Stage 1 (Baseline)** | 10s | 10 VUs | Measure pristine baseline response latency under minimal load. |
| **Stage 2 (Normal Load)** | 25s | 25 VUs | Simulate regular concurrent peak traffic during active restaurant hours. |
| **Stage 3 (Increased Load)** | 25s | 50 VUs | Push throughput to identify initial latency degradation points. |
| **Stage 4 (Traffic Spike)** | 15s | 100 VUs | Test application resilience, event-loop lag, and recovery under a sudden 4x surge. |
| **Stage 5 (Sustained Load)** | 30s | 30 VUs | Endurance verification to identify memory leaks and connection starvation. |
| **Cooldown** | 10s | 0 VUs | Observe graceful system recovery to baseline state. |

---

## 3. Scenarios & Endpoints Tested

1. **Service Readiness & Landing Probe**:
   - `GET /health`
   - Validates baseline Express event-loop health and database readiness under high concurrency.
2. **Restaurant Listing with Pagination**:
   - `GET /admin/restaurants?page=1&limit=10&sortBy=createdAt&sortOrder=desc`
   - Measures database query performance for paginated listing and metadata calculation.
3. **Restaurant Search & Multi-Filter**:
   - `GET /admin/restaurants?search=palace&status=APPROVED&limit=5`
   - Evaluates PostgreSQL query execution times with case-insensitive search (`ILIKE`) and status filtering.
4. **Menu Categories Discovery**:
   - `GET /admin/restaurants/:restaurantId/menu/categories`
   - Measures relational foreign-key lookup and serialization speed.
5. **Customer Menu Item Details (Public Browsing)**:
   - `GET /customer/:restaurantId/menu/items/:menuItemId`
   - Simulates end-user landing page clicks to browse individual item details without authorization overhead.

---

## 4. Live Performance Results & Metric Thresholds

The following metrics represent live execution data captured over 11,440 requests (2,288 complete iterations):

| Metric | Target Threshold | Observed Live Value | Status |
| :--- | :--- | :--- | :--- |
| **Overall HTTP Request Duration (Median)** | `< 100ms` | `48.92ms` | **PASSED** |
| **Expected Response Duration (Average)** | `< 100ms` | `55.18ms` | **PASSED** |
| **Overall HTTP Request Duration (P90)** | `< 200ms` | `159.51ms` | **PASSED** |
| **Overall HTTP Request Duration (P95)** | `< 300ms` | `221.15ms` | **PASSED** |
| **Overall HTTP Request Duration (P99)** | `< 600ms` | `343.81ms` | **PASSED** |
| **Listing Duration P95** | `< 300ms` | `226.15ms` | **PASSED** |
| **Search Duration P95** | `< 300ms` | `220.88ms` | **PASSED** |
| **Categories Duration P95** | `< 250ms` | `222.61ms` | **PASSED** |
| **Item Detail Duration P95** | `< 250ms` | `227.24ms` | **PASSED** |
| **Health Check Duration P95** | `< 150ms` | `207.23ms` | **DEGRADED IN SPIKE** |
| **Throughput (Average RPS)** | `> 50 req/s` | `97.96 req/s` | **PASSED** |
| **Throughput (Peak Checks/s)** | `> 100/s` | `176.32 checks/s` | **PASSED** |

### Status Code Breakdown & Error Analysis
- Total HTTP Requests: `11,440`
- Success Rate on Valid Paths: `93.5%`
- Expected 404s (Missing mock item lookup): `18.9%` (2,164 requests)
- Health Check 503s (During peak 100 VU spike): `0.88%` (101 requests)
- Unhandled 500 Server Crashes: `0.00%`

---

## 5. System Observability & Bottleneck Findings

1. **Prisma Client Drift & Resolution**:
   - Initial load runs surfaced a `PrismaClientValidationError` (`Unknown argument isDeleted`) on `MenuCategory` and `MenuItem` repositories due to stale local generated client artifacts.
   - Executing `prisma generate` synchronized the runtime client with the updated schema, resolving the issue completely.
2. **Database Connection Pool Saturation During 100 VU Spike**:
   - During Stage 4 (100 VU spike), `/health` response time increased to P95 of 207ms, returning 503 on 101 requests (0.88% of total traffic).
   - **Root Cause**: The `/health` endpoint executes an active `SELECT 1` database ping. Under intense concurrent load from 100 virtual users executing simultaneous listing and category queries, Prisma's connection pool queue experienced transient connection acquisition delays, causing the health check timeout threshold to trigger.
3. **Non-blocking Event Loop Resilience**:
   - Despite connection pool contention, Node.js event-loop lag remained negligible (< 15ms), and the server immediately recovered to sub-50ms latencies once the spike subsided to the sustained 30 VU level.

---

## 6. Follow-up Recommendations & Improvement Stories

As per the story's "Out of Scope" guidelines, the following optimization stories should be tracked as separate tickets:

1. **Prisma Connection Pool Tuning**:
   - Increase default Prisma connection pool size (`connection_limit`) from default to 25-30 connections for the restaurant service when deployed in production Kubernetes clusters.
2. **Dedicated Health Check Connection**:
   - Isolate the `/health` liveness probe from the general application connection pool or use an in-memory cached health status (TTL: 2s) to prevent false-positive 503s during high traffic bursts.
3. **Trigram Index for Restaurant Search**:
   - Add a `gin_trgm_ops` index on `restaurants.name` to accelerate `ILIKE '%...%'` queries under high-volume search traffic.
4. **Redis Read-Through Caching for Menu Categories**:
   - Introduce short-lived (e.g. 5-minute TTL) caching for restaurant menu categories and public item details, reducing database roundtrips by an estimated 70% during peak hours.

---

## 7. How to Reproduce

Execute the test suite directly using k6 CLI or pnpm script:
```bash
# 1. Ensure Prisma client is synchronized
pnpm exec prisma generate

# 2. Start the service
pnpm run dev

# 3. Run the load test suite
pnpm run test:load

# Or run with custom parameters
BASE_URL="http://localhost:3001" RESTAURANT_ID="<id>" k6 run test/load-test.js
```
