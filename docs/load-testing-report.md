# SpotQ Restaurant Service — Load Testing Report

- **Jira Story**: [SCRUM-879](https://spotq.atlassian.net/browse/SCRUM-879)
- **Service**: `spotq-restaurant-service`
- **Execution Date**: 2026-10-05
- **Tool**: Grafana k6 (`v0.43+`)
- **Author**: Ajex Joshy (`ajexjoshywork@gmail.com`)

---

## 1. Executive Summary

This report documents the official load and stress testing executed for the landing page and restaurant discovery flows of SpotQ. The primary objective is to evaluate application resilience, latency percentiles, error rates, and database/connection pool stability under both expected and peak traffic spikes.

Testing was conducted across 5 controlled stages ramping up to 100 concurrent virtual users (VUs), executing a total of **10,864 requests** and **21,728 validation checks** at **93.78 req/s** (187.56 checks/s).

All core business discovery latency thresholds (`p95 < 300ms`) were achieved with an average expected request duration of **74.64ms** (median: **36.32ms**). Under the maximum 100 VU traffic spike, transient connection pool exhaustion occurred (5.47% error rate), successfully pinpointing the infrastructure degradation threshold for follow-up tuning.

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
| **Stage 1 (Baseline)** | 10s | 10 VUs | Measure baseline response latency under minimal load. |
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

---

## 4. Official Performance Results & Metric Thresholds

The following metrics represent live execution data captured over 10,864 requests (2,716 iterations):

| Metric | Target Threshold | Observed Live Value | Status |
| :--- | :--- | :--- | :--- |
| **Overall HTTP Request Duration (Median)** | `< 100ms` | `38.91ms` | **PASSED** |
| **Expected Response Duration (Average)** | `< 100ms` | `74.64ms` | **PASSED** |
| **Expected Response Duration (P90)** | `< 200ms` | `93.81ms` | **PASSED** |
| **Expected Response Duration (P95)** | `< 250ms` | `150.55ms` | **PASSED** |
| **Overall HTTP Request Duration (P95)** | `< 300ms` | `220.90ms` | **PASSED** |
| **Overall HTTP Request Duration (P99)** | `< 600ms` | `1.28s` | **CROSS (SPIKE DEGRADATION)** |
| **Listing Duration P95** | `< 300ms` | `238.99ms` | **PASSED** |
| **Search Duration P95** | `< 300ms` | `230.52ms` | **PASSED** |
| **Categories Duration P95** | `< 250ms` | `221.11ms` | **PASSED** |
| **Health Check Duration P95** | `< 150ms` | `230.75ms` | **CROSS (SPIKE DEGRADATION)** |
| **HTTP Request Failure Rate** | `< 1.00%` | `5.47%` | **CROSS (SPIKE EXHAUSTION)** |
| **Request Success Rate** | `> 99.00%` | `94.52%` | **94.52% (10,269 / 10,864)** |
| **Throughput (Requests/sec)** | `> 50 req/s` | `93.78 req/s` | **PASSED** |
| **Throughput (Checks/sec)** | `> 100/s` | `187.56 checks/s` | **PASSED** |

### Endpoint Validation Checks Breakdown

| Check Scenario | Succeeded | Failed | Pass Rate |
| :--- | :--- | :--- | :--- |
| **Health Check (`GET /health`)** | 2,616 | 100 | **96%** |
| **Restaurant Listings (`GET /admin/restaurants`)** | 2,508 | 208 | **92%** |
| **Search & Filtering (`GET /admin/restaurants?search=...`)** | 2,528 | 188 | **93%** |
| **Category Discovery (`GET /admin/.../categories`)** | 2,617 | 99 | **96%** |
| **Total Checks** | **20,638** | **1,090** | **94.98%** |

---

## 5. System Observability & Bottleneck Findings

1. **Prisma Client Synchronization**:
   - Initial load runs surfaced a `PrismaClientValidationError` (`Unknown argument isDeleted`) on `MenuCategory` repository.
   - Executing `prisma generate` synchronized the runtime client with the updated schema, enabling all category endpoints to return 200 OK.
2. **Database Connection Pool Saturation During 100 VU Spike**:
   - During Stage 4 (100 VU spike), tail P99 latency increased to 1.28s, and 595 requests (5.47%) failed with transient connection acquisition timeouts (503).
   - **Root Cause**: The default Prisma connection pool size was saturated by 100 concurrent virtual users executing parallel database queries. Requests queued waiting for an available database socket until the connection timeout elapsed.
3. **Health Check Contention**:
   - The `/health` endpoint executes an active `SELECT 1` ping. During the 100 VU spike, the health probe competed for database sockets against heavy listing and search queries, pushing Health P95 to 230.75ms and failing 100 checks.
4. **Self-Healing & Auto-Recovery**:
   - Node.js event-loop lag remained stable (< 15ms). Immediately after the 100 VU spike ended and traffic leveled to the sustained 30 VU profile, error rates dropped back to 0.00% and median latency returned to sub-40ms without manual intervention or process restart.

---

## 6. Follow-up Recommendations & Improvement Stories

As per the story's "Out of Scope" guidelines, the following optimization stories should be tracked as separate tickets:

1. **Prisma Connection Pool Tuning**:
   - Configure explicit `connection_limit=25` (or higher) in `DATABASE_URL` for production/staging containers to comfortably sustain traffic surges beyond 75 concurrent users.
2. **Decouple Health Check Database Probe**:
   - Implement an in-memory cached database status (e.g., TTL of 2–3 seconds) in `health-check.service.ts` so liveness probes do not contend for database sockets during high-concurrency traffic bursts.
3. **Trigram Index for Restaurant Search**:
   - Add a PostgreSQL `gin_trgm_ops` index on `restaurants.name` to accelerate `ILIKE '%...%'` queries.
4. **Redis Read-Through Caching for Menu Categories**:
   - Cache menu categories with a short TTL (5 minutes), offloading ~95% of category database read queries under load.

---

## 7. How to Reproduce

Execute the test suite directly using k6 CLI or pnpm script:
```bash
# 1. Start the service
pnpm run dev

# 2. Run the load test suite
pnpm run test:load

# Or run with custom parameters
BASE_URL="http://localhost:3001" RESTAURANT_ID="<id>" k6 run test/load-test.js
```
