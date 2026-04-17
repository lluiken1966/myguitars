# QA Report

## Verdict: PASS

## Test Summary

All implementation artifacts for the "Password Forgotten" feature were reviewed against the BRD requirements, security best practices, and code quality standards. TypeScript compilation passes with zero errors. The implementation is complete, secure, and well-structured.

---

## Requirements Coverage Matrix

| # | BRD Requirement | Status | Evidence |
|---|---|---|---|
| R1 | Mail the reset password link | ✅ PASS | `lib/email.ts` sends email via nodemailer with configurable SMTP; `app/actions/auth.ts:78-84` constructs reset URL and calls `sendPasswordResetEmail()` |
| R2 | Link has a live time of 1 hour | ✅ PASS | `app/actions/auth.ts:74` sets `expiresAt: new Date(Date.now() + 60 * 60 * 1000)`; `auth.ts:109` validates `resetToken.expiresAt < new Date()` |
| R3 | Figure out which mail server to use | ✅ PASS | `lib/email.ts` uses configurable SMTP via env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`); supports any provider |

---

## Test Cases

### TC-01: Happy Path — Request Password Reset

**Given** a registered user with email `user@example.com`
**When** they submit the forgot-password form with their email
**Then**
- A password reset token is created in `PASSWORD_RESET_TOKENS` (SHA-256 hash stored, not raw token)
- An email is sent containing a reset URL with the raw token
- The response shows a generic message: "If an account with that email exists, we have sent a password reset link."
- The token expires in 1 hour

**Verified in code:** `app/actions/auth.ts:12-93`, `lib/email.ts:21-43`

### TC-02: Happy Path — Reset Password with Valid Token

**Given** a user has a valid, unused, non-expired reset token
**When** they submit the reset-password form with a new password and confirmation
**Then**
- The user's password is updated (bcrypt hash, cost factor 12)
- The `tokenVersion` column is incremented by 1 (inside a transaction)
- The token is marked as used (`USED_AT = NOW()`)
- The user is redirected to `/auth/signin?reset=success`
- A green flash message appears: "Your password has been reset. Please sign in with your new password."

**Verified in code:** `app/actions/auth.ts:95-135`, `app/auth/signin/page.tsx:56-59`

### TC-03: Account Enumeration Prevention — Non-Existent Email

**Given** an email that is NOT registered in the system
**When** the forgot-password form is submitted with that email
**Then**
- The same generic message is returned (identical to a valid email)
- Response time is at least 200ms (timing attack mitigation)
- No email is sent
- No error is exposed

**Verified in code:** `app/actions/auth.ts:31-36` (user not found path), timing at line 33-34

### TC-04: Rate Limiting — Exceed 3 Requests Per Hour

**Given** a user has already requested 3 password reset tokens within the last hour
**When** they request a 4th token
**Then**
- The generic success message is still returned (no enumeration leak)
- No new token is created
- No email is sent
- Response time is at least 200ms

**Verified in code:** `app/actions/auth.ts:38-49` — counts ALL tokens (used + unused) `WHERE CREATED_AT > oneHourAgo`

### TC-05: Expired Token

**Given** a user has a token that was created more than 1 hour ago
**When** they submit the reset-password form with that token
**Then**
- They are redirected to `/auth/signin?reset=invalid`
- A yellow flash message appears: "This reset link is invalid or has expired. Please request a new one."
- No password change occurs

**Verified in code:** `app/actions/auth.ts:109` checks `resetToken.expiresAt < new Date()`

### TC-06: Already-Used Token

**Given** a user has a token that has already been redeemed
**When** they attempt to use the same token again
**Then**
- They are redirected to `/auth/signin?reset=invalid`
- No password change occurs

**Verified in code:** `app/actions/auth.ts:109` checks `resetToken.usedAt !== null`

### TC-07: Invalid/Tampered Token

**Given** a random or tampered token string
**When** submitted to the reset-password endpoint
**Then**
- If not 64 characters: Zod validation fails (`lib/schemas.ts:104`)
- If 64 characters but no DB match: redirect to `/auth/signin?reset=invalid`

**Verified in code:** `lib/schemas.ts:104`, `app/actions/auth.ts:107-111`

### TC-08: Session Invalidation After Password Reset

**Given** a user has active JWT sessions
**When** their password is reset (tokenVersion incremented)
**Then**
- On next JWT callback, `tokenVersion` in token no longer matches DB
- JWT callback returns empty token (`{} as typeof token`)
- Session callback returns empty session (no `token.sub`)
- User is effectively forced to re-authenticate

**Verified in code:** `lib/auth.ts:46-54` (version mismatch → empty token), `lib/auth.ts:58-63` (no sub → empty session)

### TC-09: Prior Token Invalidation

**Given** a user requests a new password reset while having unused tokens
**When** the new token is created
**Then**
- All prior unused tokens for that user are marked as used (`USED_AT = NOW()`)
- Only the latest token is valid

**Verified in code:** `app/actions/auth.ts:51-57`

### TC-10: Password Validation Rules

**Given** a user is on the reset-password page
**When** they enter a password
**Then** the password must satisfy ALL of:
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one digit
- At least one special character

Password hints are displayed on the form.

**Verified in code:** `lib/schemas.ts:90-96`, `app/auth/reset-password/page.tsx:55-61`

### TC-11: Password Confirmation Mismatch

**Given** a user enters a valid password but the confirmation field differs
**When** they submit the form
**Then**
- Client-side: Zod refinement shows "Passwords do not match"
- Server-side: `resetPasswordSchema.safeParse` fails, redirects to `?reset=invalid`

**Verified in code:** `lib/schemas.ts:108-111`, `app/actions/auth.ts:96-98`

### TC-12: Missing Token in URL

**Given** a user navigates to `/auth/reset-password` without a `?token=` parameter
**When** the page loads
**Then** they are redirected to `/auth/signin`

**Verified in code:** `app/auth/reset-password/page.tsx:25-28`

### TC-13: Forgot Password Link on Sign-In Page

**Given** a user is on the sign-in page
**When** they look for password recovery options
**Then** a "Forgot password?" link is visible, linking to `/auth/forgot-password`

**Verified in code:** `app/auth/signin/page.tsx:96-100`

### TC-14: Flash Messages on Sign-In

**Given** a user is redirected to sign-in after password reset flow
**When** the URL contains `?reset=success` or `?reset=invalid`
**Then**
- `success`: Green flash message — "Your password has been reset…"
- `invalid`: Yellow flash message — "This reset link is invalid or has expired…"
- Flash messages are dismissible (click to hide)

**Verified in code:** `app/auth/signin/page.tsx:56-65`

### TC-15: Transaction Atomicity

**Given** a valid token is submitted for password reset
**When** the password update executes
**Then** all three operations happen in a single DB transaction:
1. Password hash updated
2. `tokenVersion` incremented
3. Token marked as used

If any operation fails, all are rolled back.

**Verified in code:** `app/actions/auth.ts:115-132` — `ds.transaction(async (manager) => { ... })`

---

## Bug Report

**No blocking bugs found.**

### Minor Observations (Non-Blocking)

| # | Severity | Description | File | Recommendation |
|---|---|---|---|---|
| O1 | Low | JWT `tokenVersion` property not declared in `types/next-auth.d.ts` — works because NextAuth JWT type extends `Record<string, unknown>`, but explicit typing is better practice | `types/next-auth.d.ts` | Add `declare module "next-auth/jwt" { interface JWT { tokenVersion?: number } }` — cosmetic, not blocking |
| O2 | Info | If SMTP is down, token is created and counts against rate limit but no email is sent — user sees generic success message | `app/actions/auth.ts:80-84` | Acceptable trade-off for anti-enumeration; token expires in 1h |
| O3 | Info | Migration SQL not yet executed (no DB in build env) | `mariadb_migration_add_password_reset.sql` | Must be run before feature goes live — documented in implementation report |
| O4 | Info | SMTP env vars not yet configured | `lib/email.ts` | Deployment dependency — stakeholder must provide credentials |

---

## Non-Functional Test Results

### Security

| Check | Status | Details |
|---|---|---|
| Account enumeration prevention | ✅ PASS | All code paths return identical generic message |
| Timing attack prevention | ✅ PASS | 200ms minimum enforced on all paths (lines 33-34, 46-47, 89-90) |
| Token storage security | ✅ PASS | SHA-256 hash stored; raw token only in email URL |
| Rate limiting | ✅ PASS | Max 3 tokens/hour/user; counts all tokens (used + unused) |
| CSRF protection | ✅ PASS | Server actions use Next.js built-in CSRF protection |
| Password hashing | ✅ PASS | bcrypt with cost factor 12 |
| Session invalidation | ✅ PASS | tokenVersion increment + JWT callback validation |
| Token entropy | ✅ PASS | `crypto.randomBytes(32)` = 256 bits of entropy |
| Transaction safety | ✅ PASS | Password + tokenVersion + token consumption in single DB transaction |
| Input validation | ✅ PASS | Zod schemas validate both client-side and server-side |
| XSS prevention | ✅ PASS | React auto-escapes; plain text email (no HTML injection) |
| SQL injection | ✅ PASS | TypeORM parameterized queries throughout |

### Accessibility

| Check | Status | Details |
|---|---|---|
| Form labels | ✅ PASS | All inputs have associated `<label>` with `htmlFor` |
| Input `id` attributes | ✅ PASS | `id="email"`, `id="password"`, `id="confirmPassword"` |
| Autocomplete hints | ✅ PASS | `autoComplete="email"`, `autoComplete="new-password"` |
| Error messages | ✅ PASS | Inline form errors next to relevant fields |
| Password hints visible | ✅ PASS | Requirements listed below password field |
| Keyboard navigation | ✅ PASS | Standard form elements, no custom widgets |

### Performance

| Check | Status | Details |
|---|---|---|
| DB indexes | ✅ PASS | Indexes on `USER_ID`, `TOKEN_HASH`, `EXPIRES_AT` |
| Lazy cleanup | ✅ PASS | Expired tokens cleaned up opportunistically, not via cron |
| Connection pooling | ✅ PASS | Singleton DataSource with pool limit 4 |
| JWT DB query concern | ⚠️ NOTE | Every JWT callback queries DB for tokenVersion — acceptable for current scale, may need caching at high traffic |

### Code Quality

| Check | Status | Details |
|---|---|---|
| TypeScript compilation | ✅ PASS | `npx tsc --noEmit` — zero errors |
| Schema reuse | ✅ PASS | Same Zod schemas used client-side and server-side |
| Entity registration | ✅ PASS | `PasswordResetToken` registered in `lib/db.ts` entities array + metadata check |
| Dependency installation | ✅ PASS | `nodemailer` ^7.0.13 and `@types/nodemailer` ^8.0.0 in `package.json` |
| Migration ready | ✅ PASS | `mariadb_migration_add_password_reset.sql` correctly creates table + alters USERS |

---

## Final QA Verdict

**PASS** — The password forgotten functionality is fully implemented and meets all BRD requirements. The implementation demonstrates strong security practices (hash-based token storage, timing attack prevention, rate limiting, session invalidation, transaction safety). All frontend pages are complete with proper validation, error handling, and user feedback. TypeScript compilation is clean. No blocking bugs were found. The feature is ready for deployment once the database migration is executed and SMTP credentials are configured.