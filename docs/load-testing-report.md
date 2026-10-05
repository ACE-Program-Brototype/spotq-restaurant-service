# SpotQ Restaurant Service — Load Testing Report

- **Jira Story**: [SCRUM-879](https://spotq.atlassian.net/browse/SCRUM-879)
- **Service**: `spotq-restaurant-service`
- **Execution Date**: 2026-10-05
- **Tool**: Grafana k6 (`v0.43+`)
- **Author**: Ajex Joshy (`ajexjoshywork@gmail.com`)

---

## 1. Executive Summary

This report documents the load and stress testing executed for the landing page and restaurant discovery flows of SpotQ. The primary objective is to evaluate application resilience, latency percentiles, error rates, and database/connection pool stability under both expected and peak traffic spikes.

Testing was conducted in 5 controlled stages ramping up to 100 concurrent virtual users (VUs), covering health checks, paginated restaurant listings, multi-filter search queries, menu category discovery, and public customer menu item lookups.

All critical percentile thresholds (`p95 < 300ms`, `p99 < 600ms`, `http_req_failed < 1%`) were satisfied with zero unhandled 5xx server exceptions.

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

## 4. Performance Results & Metric Thresholds

| Metric | Target Threshold | Observed Value | Status |
| :--- | :--- | :--- | :--- |
| **P50 Response Time (Median)** | `< 100ms` | `48.2ms` | **PASSED** |
| **P90 Response Time** | `< 200ms` | `112.6ms` | **PASSED** |
| **P95 Response Time** | `< 300ms` | `184.1ms` | **PASSED** |
| **P99 Response Time** | `< 600ms` | `328.4ms` | **PASSED** |
| **Health Check P95** | `< 150ms` | `14.2ms` | **PASSED** |
| **Listing Duration P95** | `< 300ms` | `168.5ms` | **PASSED** |
| **Search Duration P95** | `< 300ms` | `214.8ms` | **PASSED** |
| **Categories Duration P95** | `< 250ms` | `98.3ms` | **PASSED** |
| **Item Detail Duration P95** | `< 250ms` | `82.7ms` | **PASSED** |
| **HTTP Request Failure Rate** | `< 1.00%` | `0.00%` | **PASSED** |
| **Throughput (Peak RPS)** | `> 50 req/s` | `132.4 req/s` | **PASSED** |

### HTTP Status Code Distribution
- `HTTP 200 OK`: `98.4%`
- `HTTP 404 NOT FOUND` (expected missing mock items): `1.6%`
- `HTTP 5xx Server Errors`: `0.00%`

---

## 5. System Observability & Bottleneck Findings

1. **Event-Loop & CPU Utilization**:
   - Peak CPU utilization reached approximately 42% on single-core during the 100 VU spike stage.
   - Node.js event-loop lag remained under 12ms throughout the spike test, indicating non-blocking I/O execution.
2. **Database Query Performance**:
   - `GET /admin/restaurants` with pagination: Average query time was 28ms for Page 1.
   - Deep pagination (offset queries beyond page 5) showed minor latency increase (~45ms) due to sequential offset scanning.
   - Search filtering with `ILIKE` on restaurant name caused index scan fallbacks on unindexed fields.
3. **Connection Pool Stability**:
   - Prisma Client connection pool handled the 100 concurrent VU spike without connection pool timeouts or connection exhaustion.
   - No `ECONNREFUSED` or connection starvation errors occurred.

---

## 6. Follow-up Recommendations & Improvement Stories

As per the story's "Out of Scope" guidelines, the following optimization stories should be tracked as separate tickets:

1. **Trigram Index for Restaurant Search**:
   - Add a `gin_trgm_ops` index on `restaurants.name` to accelerate `ILIKE '%...%'` queries under high-volume search traffic.
2. **Redis Read-Through Caching for Menu Categories**:
   - Introduce short-lived (e.g. 5-minute TTL) caching for restaurant menu categories and public item details, reducing database roundtrips by an estimated 70% during peak hours.
3. **Cursor-Based Pagination for Restaurant Listings**:
   - Transition high-volume listing endpoints from offset-based (`skip/take`) to cursor-based pagination (`id > cursor`) to eliminate query degradation on deeper pages.

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
