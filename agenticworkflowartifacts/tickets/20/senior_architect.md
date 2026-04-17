# Design Review

## Verdict: APPROVED

The Technical Design for the password forgotten functionality is thorough, security-conscious, and well-aligned with both the BRD requirements and the existing MyGuitars codebase. After verifying the design against the actual source code, I am confident this design is ready for task generation.

---

## Critical Blockers

**None.** No critical issues were identified.

---

## Major Concerns

**None.** The design is solid across all major dimensions. All audit findings (W1–W5, R1–R6) are properly addressed with concrete implementation strategies.

---

## Minor Suggestions

### 1. Rate Limit Count Query Clarity (Low Risk)
The `requestPasswordReset` flow (Section 4.1, step 5) counts tokens where `CREATED_AT > NOW() - INTERVAL 1 HOUR` without filtering by `USED_AT`. This is actually correct — invalidated tokens should still count toward the rate limit to prevent circumvention. However, the design should explicitly note this intent so implementers don't "optimize" by adding a `USED_AT IS NULL` filter.

### 2. JWT Callback Trigger Check (Low Risk)
Section 5.3 shows TOKEN_VERSION being checked on every authenticated request, while Section 7.2 recommends checking only on session refresh. The design should specify the definitive approach. **Recommendation:** Check on every `jwt` callback invocation initially (simpler, more secure), and optimize later if DB load becomes a concern. With a 4-connection pool and the app's expected traffic, this is negligible overhead.

### 3. Lazy Cleanup Scope (Low Risk)
Section 7.1 Option A cleans up tokens only for the requesting user. For a small-scale app this is fine, but a comment in the implementation noting this is user-scoped (not global) would prevent confusion. No design change needed — just an implementation note.

### 4. Password Schema Reuse for Registration (Out of Scope, Noted)
The design correctly notes that applying `passwordSchema` to the registration form is out of scope for this card. This should be tracked as a follow-up task to ensure password policy consistency across all entry points.

### 5. Email Content — Consider Adding Expiration Notice
The BRD specifies a 1-hour token lifetime. The reset email should mention this expiration ("This link expires in 1 hour") so users understand the time constraint. This is a minor UX improvement that costs nothing to implement.

---

## Security Assessment

### Strengths

| Area | Assessment |
|---|---|
| **Account Enumeration Prevention** | Excellent. Consistent response message across all code paths (user not found, rate-limited, SMTP failure). Timing-attack mitigation via minimum delay is a strong addition. |
| **Token Security** | Excellent. 256-bit entropy via `crypto.randomBytes(32)`, SHA-256 hash stored (raw token never persisted), 1-hour expiry, single-use enforcement via `USED_AT`, prior tokens invalidated on new request. |
| **Password Hashing** | Correct. bcrypt with 12 salt rounds, consistent with existing registration flow. |
| **Session Invalidation** | Well-designed. `TOKEN_VERSION` increment on password reset forces re-authentication on all devices. This is the standard approach for JWT-based auth systems. |
| **Rate Limiting** | Adequate. 3 requests per email per hour, implemented via token count (no separate table needed). Dual-purpose use of the tokens table is elegant. |
| **CSRF Protection** | Handled automatically by Next.js Server Actions. No additional work needed. |
| **SMTP Credentials** | Environment variables only — no secrets in source code. |
| **Input Validation** | Zod schemas on both client and server side, consistent with existing codebase patterns. Password complexity rules address all audit findings (W2, W3). |

### No OWASP Top 10 Vulnerabilities Identified

- **Injection:** Parameterized queries via TypeORM — no raw SQL with user input.
- **Broken Authentication:** Token-based flow with proper entropy, hashing, expiration, and single-use enforcement.
- **Sensitive Data Exposure:** Raw tokens transmitted only via HTTPS (email link + POST body). SHA-256 hash stored in DB.
- **Security Misconfiguration:** SMTP credentials in env vars, not hardcoded.
- **XSS:** Server-side rendering + React's built-in escaping. Flash messages use query params rendered by React, not raw HTML injection.

---

## Codebase Verification Results

I verified the design's assumptions against the actual codebase:

| Assumption | Verified |
|---|---|
| `entities/User.ts` does not have `TOKEN_VERSION` | ✓ Confirmed — column must be added |
| `lib/auth.ts` uses JWT strategy with `jwt` and `session` callbacks | ✓ Confirmed — callbacks exist and are extensible |
| `lib/db.ts` entity list is `[Guitar, User, GuitarImage, Amp, AmpImage]` | ✓ Confirmed — `PasswordResetToken` must be registered |
| `lib/schemas.ts` has no password-related schemas | ✓ Confirmed — only `GuitarSchema` and `AmpSchema` exist |
| `app/actions/auth.ts` does not exist | ✓ Confirmed — must be created |
| `lib/email.ts` does not exist | ✓ Confirmed — must be created |
| `bcryptjs` is already installed | ✓ Confirmed — `bcryptjs: ^3.0.3` in package.json |
| `nodemailer` is not installed | ✓ Confirmed — must be added |
| Server actions follow `"use server"` + session check + Zod validation + DB operation + revalidatePath pattern | ✓ Confirmed via `app/actions/guitars.ts` |
| Migration files follow `mariadb_migration_*.sql` naming | ✓ Confirmed — 3 existing migration files follow this pattern |
| USERS table has `UNIQUE KEY UQ_USERS_EMAIL` | ✓ Confirmed in `mariadb_schema.sql` |

---

## Architecture & Consistency

- **Server Actions over API Routes:** Correct choice, consistent with existing CRUD pattern. API routes are reserved for binary data (images) and NextAuth.
- **Separate PASSWORD_RESET_TOKENS table:** Better than adding columns to USERS. Supports rate limiting via row count, keeps USERS table clean, and allows full token lifecycle tracking.
- **Implementation phasing:** Dependencies are correctly ordered (DB → schemas → email → actions → frontend → session → polish). No circular dependencies.
- **TypeORM entity patterns:** The `PasswordResetToken` entity follows the exact same decorator and naming patterns as existing entities (`Guitar`, `GuitarImage`, etc.).

---

## Final Recommendation

**APPROVED for task generation.** This is an exceptionally thorough technical design that significantly exceeds the minimal BRD requirements — appropriately so, given that password reset is a security-critical feature. All prior audit findings are addressed with concrete, verifiable implementation strategies. The design integrates cleanly with the existing codebase patterns and introduces no unnecessary complexity. The minor suggestions above are quality-of-life improvements, not blockers.