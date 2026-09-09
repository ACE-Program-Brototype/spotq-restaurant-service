# PR Review Issues

## 1. P1: Profile authorization trusts caller-controlled headers

- **File:** `src/presentation/http/middleware/staff.auth.middleware.ts`
- **Line:** 23
- **Issue:** The middleware treats `x-user-id` and `x-user-role` as authentication proof, but it does not validate a bearer token, verify a gateway signature, or otherwise establish that these headers were added by a trusted proxy. This service mounts the route directly in `app.ts`, so a caller who can reach the service can send `x-user-id` for any staff member and `x-user-role: staff`, then retrieve that member's profile.
- **PR comment:** Please authenticate the request with the existing access-token/JWKS flow, or enforce a documented trusted-gateway boundary and reject direct traffic. Header values supplied by the client must not determine the staff identity.

## 2. P2: Reconstitution now invents persistence data

- **File:** `src/domain/entities/restaurant-staff.entity.ts`
- **Lines:** 44, 123, 190
- **Issue:** `passwordHash`, `createdAt`, and `updatedAt` were changed from required persisted fields to optional values. When a record is reconstituted without timestamps, the entity silently substitutes `new Date()`, and the getters create another new date on every access. A profile response can therefore report the current time as `created_at` instead of the database creation time, and repeated reads of the same entity can produce different timestamps. Missing password hashes are also converted to an empty string instead of being rejected.
- **PR comment:** Keep persisted fields required on `ReconstituteRestaurantStaffProps` and preserve the values returned by persistence. If a partial object is needed for tests or profile creation, use a separate DTO/type rather than weakening the domain invariant.

## Validation

- `pnpm build` passed.
- `pnpm lint` passed.
- `pnpm exec jest --runInBand --forceExit` passed: 27 suites, 116 tests.