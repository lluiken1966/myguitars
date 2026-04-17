# Implementation Tasks: Password Forgotten Functionality

## Environment Setup (One-Time)

Before implementation begins, complete these setup steps:

| # | Step | Details |
|---|---|---|
| E1 | Install nodemailer | `npm install nodemailer` and `npm install -D @types/nodemailer` |
| E2 | Add SMTP env vars to `.env.local` | `SMTP_HOST=smtp.strato.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER=<from stakeholder>`, `SMTP_PASSWORD=<from stakeholder>`, `SMTP_FROM=noreply@walidoka.nl` |
| E3 | Run database migration | Execute `mariadb_migration_add_password_reset.sql` against the MariaDB instance after creating it in Task 1.1 |

---

## Epic 1: Database & Entity Layer

### Task 1.1 — Create database migration file

| Field | Value |
|---|---|
| **Description** | Create `mariadb_migration_add_password_reset.sql` with: (1) `CREATE TABLE PASSWORD_RESET_TOKENS` with columns `id` (VARCHAR(36) PK), `USER_ID` (VARCHAR(36) FK → USERS.id ON DELETE CASCADE), `TOKEN_HASH` (VARCHAR(64)), `EXPIRES_AT` (DATETIME), `USED_AT` (DATETIME nullable), `CREATED_AT` (DATETIME DEFAULT CURRENT_TIMESTAMP). Add indexes on `USER_ID`, `TOKEN_HASH`, `EXPIRES_AT`. (2) `ALTER TABLE USERS ADD COLUMN TOKEN_VERSION INT NOT NULL DEFAULT 1`. Use InnoDB engine, utf8mb4 charset. |
| **Files** | `mariadb_migration_add_password_reset.sql` (create) |
| **Complexity** | S |
| **Dependencies** | None |
| **Acceptance Criteria** | Migration SQL executes without errors against the existing schema. `PASSWORD_RESET_TOKENS` table exists with all columns, indexes, and FK constraint. `USERS.TOKEN_VERSION` column exists with default value 1. Existing user rows get TOKEN_VERSION = 1. |

### Task 1.2 — Create PasswordResetToken TypeORM entity

| Field | Value |
|---|---|
| **Description** | Create `entities/PasswordResetToken.ts` as a TypeORM entity mapping to `PASSWORD_RESET_TOKENS`. Fields: `id` (PrimaryGeneratedColumn uuid), `userId` (Column → USER_ID), `tokenHash` (Column → TOKEN_HASH, length 64), `expiresAt` (Column → EXPIRES_AT, datetime), `usedAt` (Column → USED_AT, datetime, nullable), `createdAt` (CreateDateColumn → CREATED_AT). Add `@ManyToOne` relation to User with `onDelete: "CASCADE"` and `@JoinColumn({ name: "USER_ID" })`. Follow the same decorator and naming patterns used in `entities/GuitarImage.ts`. |
| **Files** | `entities/PasswordResetToken.ts` (create) |
| **Complexity** | S |
| **Dependencies** | Task 1.1 (migration must exist; entity must match table schema) |
| **Acceptance Criteria** | Entity compiles without TypeScript errors. All column mappings match the migration SQL exactly. Entity follows existing project patterns (decorator style, naming conventions). |

### Task 1.3 — Add tokenVersion to User entity

| Field | Value |
|---|---|
| **Description** | Add `tokenVersion` field to `entities/User.ts`: `@Column({ name: "TOKEN_VERSION", type: "int", default: 1 }) tokenVersion: number;`. This field enables JWT session invalidation — when incremented, all existing JWTs for that user become invalid. |
| **Files** | `entities/User.ts` (modify) |
| **Complexity** | S |
| **Dependencies** | Task 1.1 (column must exist in DB) |
| **Acceptance Criteria** | User entity has `tokenVersion` field. Field maps to `TOKEN_VERSION` column. Default value is 1. No TypeScript errors. |

### Task 1.4 — Register PasswordResetToken in DataSource

| Field | Value |
|---|---|
| **Description** | Add `PasswordResetToken` to the entities array in `lib/db.ts`. Current entities: `[Guitar, User, GuitarImage, Amp, AmpImage]`. Import from `@/entities/PasswordResetToken`. |
| **Files** | `lib/db.ts` (modify) |
| **Complexity** | S |
| **Dependencies** | Task 1.2 |
| **Acceptance Criteria** | `PasswordResetToken` is imported and included in the DataSource entities array. DataSource initializes without errors. |

---

## Epic 2: Validation Schemas

### Task 2.1 — Add password and reset schemas to lib/schemas.ts

| Field | Value |
|---|---|
| **Description** | Add three Zod schemas to `lib/schemas.ts`: (1) `passwordSchema` — `z.string().min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/)` with descriptive error messages for each rule. (2) `forgotPasswordSchema` — `z.object({ email: z.string().email("Please enter a valid email address") })`. (3) `resetPasswordSchema` — `z.object({ token: z.string().length(64, "Invalid token"), password: passwordSchema, confirmPassword: z.string() }).refine(data => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] })`. Export all three schemas and their inferred types. |
| **Files** | `lib/schemas.ts` (modify) |
| **Complexity** | S |
| **Dependencies** | None |
| **Acceptance Criteria** | All three schemas export correctly. `passwordSchema` rejects: strings under 8 chars, strings without uppercase, strings without lowercase, strings without digit, strings without special char. `passwordSchema` accepts valid passwords (e.g. `Test123!`). `resetPasswordSchema` rejects mismatched passwords. `forgotPasswordSchema` rejects invalid emails. No TypeScript errors. |

---

## Epic 3: Email Service

### Task 3.1 — Create email service module

| Field | Value |
|---|---|
| **Description** | Create `lib/email.ts` with a `sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>` function. Use nodemailer to connect to Strato SMTP via environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`). Create the transporter lazily (singleton pattern, similar to how `lib/db.ts` handles the DataSource). Send a plain-text email (no HTML) with: subject "Password Reset — MyGuitars", body containing a brief message, the reset URL, and a note that the link expires in 1 hour (per Design Review suggestion #5). The function should throw on SMTP errors (caller handles error suppression). |
| **Files** | `lib/email.ts` (create) |
| **Complexity** | M |
| **Dependencies** | Environment setup E1 (nodemailer installed), E2 (env vars) |
| **Acceptance Criteria** | Module exports `sendPasswordResetEmail`. Uses env vars for SMTP config (no hardcoded credentials). Email is plain text, includes reset URL and 1-hour expiry notice. Transporter uses TLS (port 465, secure: true). Function throws on SMTP failure. No TypeScript errors. |

---

## Epic 4: Server Actions

### Task 4.1 — Implement requestPasswordReset server action

| Field | Value |
|---|---|
| **Description** | Create `app/actions/auth.ts` with `"use server"` directive. Implement `requestPasswordReset(formData)` following the pattern in `app/actions/guitars.ts`: (1) Validate input with `forgotPasswordSchema`. (2) Normalize email: `toLowerCase().trim()`. (3) Look up user by email in USERS table. (4) If user not found → return generic success (account enumeration prevention). (5) Rate-limit check: count PASSWORD_RESET_TOKENS for this user where `CREATED_AT > NOW() - 1 hour` (include ALL tokens, not just unused — per Design Review note #1). If >= 3 → return generic success, no email. (6) Invalidate prior tokens: `SET USED_AT = NOW()` on all unused tokens for this user. (7) Lazy cleanup: delete tokens for this user where `EXPIRES_AT < NOW() - 24 hours`. (8) Generate token: `crypto.randomBytes(32).toString('hex')`. (9) Hash: `crypto.createHash('sha256').update(rawToken).digest('hex')`. (10) Store token with `EXPIRES_AT = NOW() + 1 hour`. (11) Build reset URL: `${NEXTAUTH_URL}/auth/reset-password?token=${rawToken}`. (12) Send email via `sendPasswordResetEmail` — catch and log errors server-side, never expose to user. (13) Add minimum 200ms delay for timing-attack prevention. (14) Return `{ success: true, message: "If an account with that email exists, we have sent a password reset link." }`. All code paths return the same response shape and message. |
| **Files** | `app/actions/auth.ts` (create) |
| **Complexity** | L |
| **Dependencies** | Tasks 1.2, 1.3, 1.4, 2.1, 3.1 |
| **Acceptance Criteria** | Server action compiles and runs. Returns identical response for: valid email, non-existent email, rate-limited email, SMTP failure. Rate limit enforced at 3 per hour (counts all tokens including invalidated). Prior unused tokens invalidated on new request. Token stored as SHA-256 hash (raw token never in DB). Lazy cleanup removes stale tokens. Minimum 200ms response time enforced. No information leakage in any code path. |

### Task 4.2 — Implement resetPassword server action

| Field | Value |
|---|---|
| **Description** | Add `resetPassword(formData)` to `app/actions/auth.ts`. (1) Validate input with `resetPasswordSchema`. (2) Hash incoming token with SHA-256. (3) Look up by `TOKEN_HASH` in PASSWORD_RESET_TOKENS. (4) Validate: token exists, `USED_AT` is null, `EXPIRES_AT > NOW()`. If any check fails → redirect to `/auth/signin?reset=invalid`. (5) Hash new password with `bcrypt.hash(password, 12)`. (6) In a transaction: update USERS `PASSWORD` and increment `TOKEN_VERSION`, then set `USED_AT = NOW()` on the token. (7) Redirect to `/auth/signin?reset=success`. Use `redirect()` from `next/navigation` for the redirects. |
| **Files** | `app/actions/auth.ts` (modify — add to file created in 4.1) |
| **Complexity** | M |
| **Dependencies** | Task 4.1 (file must exist), Tasks 1.2, 1.3, 2.1 |
| **Acceptance Criteria** | Invalid/expired/used tokens redirect to `/auth/signin?reset=invalid`. Valid token: password updated with bcrypt (12 rounds), TOKEN_VERSION incremented, token marked used — all in a single transaction. Redirect to `/auth/signin?reset=success` on success. Zod validation rejects mismatched passwords and weak passwords. No TypeScript errors. |

---

## Epic 5: Frontend Pages

### Task 5.1 — Create forgot-password page

| Field | Value |
|---|---|
| **Description** | Create `app/auth/forgot-password/page.tsx` as a client component. Single email input form using react-hook-form with `zodResolver(forgotPasswordSchema)`. On submit, call `requestPasswordReset` server action. Display loading state during submission. On success, show the generic confirmation message: "If an account with that email exists, we have sent a password reset link." Include a "Back to sign in" link. Use existing auth CSS classes: `.auth-page`, `.auth-card`, `.auth-title`, `.auth-form`, `.form-group`, `.btn-primary`, `.auth-footer`, `.auth-link`. |
| **Files** | `app/auth/forgot-password/page.tsx` (create) |
| **Complexity** | M |
| **Dependencies** | Tasks 2.1, 4.1 |
| **Acceptance Criteria** | Page renders at `/auth/forgot-password`. Email field validates with Zod (shows error for invalid email). Submit button shows loading state. After submission, generic success message displayed. "Back to sign in" link works. Matches existing auth page styling (dark/light theme compatible). Mobile responsive. |

### Task 5.2 — Create reset-password page

| Field | Value |
|---|---|
| **Description** | Create `app/auth/reset-password/page.tsx` as a client component. Read `token` from URL search params (`useSearchParams`). If no token present, redirect to `/auth/signin`. Form with "New password" and "Confirm password" fields using react-hook-form with `zodResolver(resetPasswordSchema)` (pass token as hidden field or merge into form data). Display password requirements as hints below the password field (min 8 chars, uppercase, lowercase, digit, special character). On submit, call `resetPassword` server action. Show loading state during submission. Handle redirect responses (success and invalid). Wrap in `<Suspense>` for `useSearchParams` (same pattern as signin page). |
| **Files** | `app/auth/reset-password/page.tsx` (create) |
| **Complexity** | M |
| **Dependencies** | Tasks 2.1, 4.2 |
| **Acceptance Criteria** | Page renders at `/auth/reset-password?token=xxx`. Missing token → redirects to sign-in. Password fields validate against all complexity rules with real-time feedback. Confirm password mismatch shows error. Submit shows loading state. Password requirement hints visible below field. Matches existing auth page styling. Mobile responsive. Dark/light theme compatible. |

### Task 5.3 — Add "Forgot password?" link and flash messages to sign-in page

| Field | Value |
|---|---|
| **Description** | Modify `app/auth/signin/page.tsx`: (1) Add a "Forgot password?" link below or near the password field, pointing to `/auth/forgot-password`. Style with existing `.auth-link` class. (2) Handle `?reset=success` query param: display a success message "Your password has been reset. Please sign in with your new password." (3) Handle `?reset=invalid` query param: display "This reset link is invalid or has expired. Please request a new one." Style messages as info/success/warning banners consistent with existing error message styling on the page. Messages should auto-dismiss or be dismissible. |
| **Files** | `app/auth/signin/page.tsx` (modify) |
| **Complexity** | S |
| **Dependencies** | Task 5.1 (link target must exist) |
| **Acceptance Criteria** | "Forgot password?" link visible on sign-in page, navigates to `/auth/forgot-password`. `?reset=success` shows green/success message. `?reset=invalid` shows warning message. Messages styled consistently with existing error display. No layout regressions on the sign-in page. |

---

## Epic 6: Session Invalidation

### Task 6.1 — Extend JWT callback for tokenVersion validation

| Field | Value |
|---|---|
| **Description** | Modify `lib/auth.ts` JWT callbacks: (1) In the `jwt` callback: on initial sign-in (when `user` object is present), fetch `tokenVersion` from the USERS table and store it in the JWT token as `token.tokenVersion`. On subsequent calls (session refresh), query the DB for the user's current `TOKEN_VERSION` and compare with `token.tokenVersion`. If they don't match, return an empty/null token to force re-authentication. Per Design Review recommendation #2, check on every `jwt` callback invocation initially for maximum security. (2) Ensure the `session` callback still works correctly. (3) Add the necessary TypeORM imports and DataSource initialization. |
| **Files** | `lib/auth.ts` (modify) |
| **Complexity** | M |
| **Dependencies** | Tasks 1.3, 1.4 |
| **Acceptance Criteria** | JWT token includes `tokenVersion` claim after sign-in. When `TOKEN_VERSION` is incremented in the DB (simulating a password reset), existing sessions become invalid on next request. Users are forced to re-authenticate after password change. No regression in normal sign-in/session flow. |

---

## Epic 7: Styling & Polish

### Task 7.1 — Style forgot-password and reset-password pages

| Field | Value |
|---|---|
| **Description** | Ensure both new auth pages match the existing sign-in/register page design. Verify: (1) Pages use existing `.auth-*` CSS classes from `globals.css` (lines ~581–653). (2) Dark/light theme support via CSS variables works correctly on both pages. (3) Password requirement hints on reset page are styled subtly (smaller text, muted color). (4) Flash messages on sign-in page (success/invalid) are styled appropriately. (5) All form elements (inputs, buttons, links) match existing auth form styling. (6) Add any additional CSS to `globals.css` only if existing classes are insufficient. |
| **Files** | `app/globals.css` (modify if needed), `app/auth/forgot-password/page.tsx` (adjust if needed), `app/auth/reset-password/page.tsx` (adjust if needed) |
| **Complexity** | S |
| **Dependencies** | Tasks 5.1, 5.2, 5.3 |
| **Acceptance Criteria** | Forgot-password and reset-password pages are visually consistent with sign-in and register pages. Dark mode and light mode both work. Password hints are readable but not obtrusive. Flash messages are visible and appropriately colored. No styling regressions on existing pages. |

### Task 7.2 — Loading states and mobile responsiveness

| Field | Value |
|---|---|
| **Description** | Verify and polish: (1) Both forms disable the submit button and show a loading indicator during submission. (2) Pages are fully responsive on mobile viewports (test at 375px width). (3) Form validation errors display correctly on mobile. (4) "Forgot password?" link on sign-in page is accessible on mobile (not too small, not hidden by overflow). |
| **Files** | `app/auth/forgot-password/page.tsx` (adjust if needed), `app/auth/reset-password/page.tsx` (adjust if needed), `app/auth/signin/page.tsx` (adjust if needed) |
| **Complexity** | S |
| **Dependencies** | Task 7.1 |
| **Acceptance Criteria** | Submit buttons show loading state and are disabled during async operations. All pages render correctly on mobile (375px viewport). Form errors visible on mobile. No horizontal overflow or layout breakage. |

---

## Dependency Graph

```
Task 1.1 (Migration SQL)
  ├─→ Task 1.2 (PasswordResetToken Entity)
  │     └─→ Task 1.4 (Register in DataSource)
  │           ├─→ Task 4.1 (requestPasswordReset action)
  │           │     ├─→ Task 5.1 (Forgot-password page)
  │           │     │     └─→ Task 5.3 (Sign-in page updates)
  │           │     └─→ Task 4.2 (resetPassword action)
  │           │           └─→ Task 5.2 (Reset-password page)
  │           └─→ Task 6.1 (JWT session invalidation)
  └─→ Task 1.3 (User entity update)
        ├─→ Task 4.1
        ├─→ Task 4.2
        └─→ Task 6.1

Task 2.1 (Zod schemas) ─→ Task 4.1, Task 4.2, Task 5.1, Task 5.2

Task 3.1 (Email service) ─→ Task 4.1

Tasks 5.1, 5.2, 5.3 ─→ Task 7.1 (Styling) ─→ Task 7.2 (Polish)
```

---

## Sprint Plan

### Sprint 1 (Week 1): Foundation + Core Logic

**Goal:** Database, entities, schemas, email service, and server actions — the entire backend is functional.

| Order | Task | Complexity | Est. Time |
|---|---|---|---|
| 1 | **E1** — Install nodemailer | — | 5 min |
| 2 | **E2** — Add SMTP env vars | — | 5 min |
| 3 | **Task 1.1** — Create migration SQL | S | 30 min |
| 4 | **E3** — Run migration | — | 5 min |
| 5 | **Task 1.2** — PasswordResetToken entity | S | 30 min |
| 6 | **Task 1.3** — User entity tokenVersion | S | 15 min |
| 7 | **Task 1.4** — Register entity in DataSource | S | 10 min |
| 8 | **Task 2.1** — Zod validation schemas | S | 30 min |
| 9 | **Task 3.1** — Email service module | M | 1 hour |
| 10 | **Task 4.1** — requestPasswordReset action | L | 2 hours |
| 11 | **Task 4.2** — resetPassword action | M | 1.5 hours |
| 12 | **Task 6.1** — JWT session invalidation | M | 1.5 hours |

**Sprint 1 total estimated time:** ~8 hours

### Sprint 2 (Week 2): Frontend + Polish

**Goal:** All UI pages, integration between frontend and backend, styling, and final polish.

| Order | Task | Complexity | Est. Time |
|---|---|---|---|
| 1 | **Task 5.1** — Forgot-password page | M | 1.5 hours |
| 2 | **Task 5.2** — Reset-password page | M | 1.5 hours |
| 3 | **Task 5.3** — Sign-in page updates | S | 45 min |
| 4 | **Task 7.1** — Styling & theme | S | 1 hour |
| 5 | **Task 7.2** — Loading states & mobile | S | 45 min |

**Sprint 2 total estimated time:** ~5.5 hours

---

## Implementation Notes

1. **Rate limit counting** (Design Review #1): When counting tokens for rate limiting, do NOT filter by `USED_AT IS NULL`. All tokens (including invalidated ones) count toward the 3-per-hour limit to prevent circumvention.

2. **JWT callback approach** (Design Review #2): Check `TOKEN_VERSION` on every `jwt` callback invocation initially. Optimize to session-refresh-only later if DB load becomes a concern.

3. **Lazy cleanup scope** (Design Review #3): Token cleanup in `requestPasswordReset` is user-scoped — it only deletes expired tokens for the requesting user, not globally. This is by design for a small-scale app.

4. **Password schema for registration** (Design Review #4): Applying `passwordSchema` to the registration form is OUT OF SCOPE for this card. Track as a follow-up task.

5. **Email expiry notice** (Design Review #5): Include "This link expires in 1 hour" in the reset email body.

6. **Consistent timing**: Add a minimum 200ms delay in `requestPasswordReset` to prevent timing-based account enumeration.

7. **Transaction in resetPassword**: The password update, TOKEN_VERSION increment, and token consumption MUST happen in a single database transaction to prevent partial state.
