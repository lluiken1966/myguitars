# Implementation Report: Password Forgotten Functionality

## Tasks Completed

### Environment Setup
| # | Task | Status |
|---|---|---|
| E1 | Install nodemailer + @types/nodemailer | Done |
| E2 | SMTP env vars | Documented in task list (requires stakeholder credentials) |
| E3 | Run database migration | Migration SQL created; execution requires DB access |

### Epic 1: Database & Entity Layer
| Task | Description | Status |
|---|---|---|
| 1.1 | Create `mariadb_migration_add_password_reset.sql` | Done |
| 1.2 | Create `entities/PasswordResetToken.ts` entity | Done |
| 1.3 | Add `tokenVersion` to `entities/User.ts` | Done |
| 1.4 | Register PasswordResetToken in `lib/db.ts` | Done |

### Epic 2: Validation Schemas
| Task | Description | Status |
|---|---|---|
| 2.1 | Add `passwordSchema`, `forgotPasswordSchema`, `resetPasswordSchema` to `lib/schemas.ts` | Done |

### Epic 3: Email Service
| Task | Description | Status |
|---|---|---|
| 3.1 | Create `lib/email.ts` with `sendPasswordResetEmail` | Done |

### Epic 4: Server Actions
| Task | Description | Status |
|---|---|---|
| 4.1 | Implement `requestPasswordReset` in `app/actions/auth.ts` | Done |
| 4.2 | Implement `resetPassword` in `app/actions/auth.ts` | Done |

### Epic 5: Frontend Pages
| Task | Description | Status |
|---|---|---|
| 5.1 | Create `app/auth/forgot-password/page.tsx` | Done |
| 5.2 | Create `app/auth/reset-password/page.tsx` | Done |
| 5.3 | Add "Forgot password?" link + flash messages to `app/auth/signin/page.tsx` | Done |

### Epic 6: Session Invalidation
| Task | Description | Status |
|---|---|---|
| 6.1 | Extend JWT callback in `lib/auth.ts` for tokenVersion validation | Done |

### Epic 7: Styling & Polish
| Task | Description | Status |
|---|---|---|
| 7.1 | Style forgot-password and reset-password pages | Done |
| 7.2 | Loading states and mobile responsiveness | Done |

## Files Created
| File | Purpose |
|---|---|
| `mariadb_migration_add_password_reset.sql` | Migration: PASSWORD_RESET_TOKENS table + USERS.TOKEN_VERSION column |
| `entities/PasswordResetToken.ts` | TypeORM entity for password reset tokens |
| `lib/email.ts` | Nodemailer-based email service (Strato SMTP, TLS) |
| `app/actions/auth.ts` | Server actions: requestPasswordReset, resetPassword |
| `app/auth/forgot-password/page.tsx` | Forgot password form page |
| `app/auth/reset-password/page.tsx` | Reset password form page (with password hints) |

## Files Modified
| File | Changes |
|---|---|
| `package.json` | Added nodemailer + @types/nodemailer |
| `entities/User.ts` | Added `tokenVersion` column (INT, default 1) |
| `lib/db.ts` | Registered PasswordResetToken entity in DataSource + metadata check |
| `lib/schemas.ts` | Added passwordSchema, forgotPasswordSchema, resetPasswordSchema + types |
| `lib/auth.ts` | JWT callback: stores tokenVersion on login, validates on every refresh, invalidates on mismatch |
| `app/auth/signin/page.tsx` | Added "Forgot password?" link, flash messages for reset=success/invalid |
| `app/globals.css` | Added CSS for .auth-message, .forgot-password-link, .flash-message, .flash-success, .flash-warning, .password-hints |

## Security Implementation Details
- **Account enumeration prevention**: All code paths in requestPasswordReset return identical generic response
- **Timing attack prevention**: Minimum 200ms delay enforced on every code path
- **Rate limiting**: 3 tokens per hour per user, counting ALL tokens (used + unused) per Design Review #1
- **Token storage**: Raw token never stored in DB; SHA-256 hash stored instead
- **Prior token invalidation**: All unused tokens marked as used before issuing a new one
- **Lazy cleanup**: Expired tokens (>24h) for requesting user are deleted on each request
- **Transaction safety**: Password update + tokenVersion increment + token consumption in single transaction
- **Session invalidation**: JWT callback checks tokenVersion on every invocation; mismatch forces re-auth

## Tasks Skipped
- **E2 (SMTP env vars)**: Requires stakeholder-provided SMTP credentials; documented format in task list
- **E3 (Run migration)**: No MariaDB instance available in build environment; migration SQL ready for execution

## Known Issues / Follow-up Items
- **Build fails at static page generation** due to no MariaDB connection in CI — this is pre-existing behavior, not caused by these changes. TypeScript compilation (`tsc --noEmit`) passes cleanly with zero errors.
- **Password schema for registration** is explicitly out of scope per Design Review #4 — track as follow-up.
- **JWT DB query on every callback** may need optimization later per Design Review #2 if DB load becomes a concern.

## Verification
- `npx tsc --noEmit` — zero TypeScript errors
- `npm run build` — TypeScript compilation and Turbopack compilation both succeed; static page generation fails due to no DB (pre-existing)
