# Audit Report

## Verdict: PASSED

The BRD for Password Forgotten functionality is well-structured, thorough, and covers security considerations comprehensively. The requirements are clear, specific, and actionable. No critical blockers were found. The warnings and recommendations below should be addressed during the architecture/design phase.

---

## Critical Issues

None.

---

## Warnings

### W1: Session Invalidation Conflicts with JWT Architecture
**Section 2.4** requires: "All existing sessions for the user are invalidated (user is logged out everywhere)." However, the application uses **stateless JWT sessions** (`lib/auth.ts` line 35: `strategy: "jwt"`). Pure JWTs cannot be server-side invalidated without additional infrastructure such as a token generation/version column in the USERS table or a token blocklist. This is not a BRD deficiency — the requirement is clear — but the architect must be aware that this is non-trivial with the current auth setup and will require a design decision.

### W2: Password Policy Missing Digit Requirement
**Section 4** requires uppercase, lowercase, and special characters but does **not** require at least one digit (0–9). Most modern password policies include a digit requirement. If this omission is intentional, it should be explicitly stated (e.g., "Digits are not required"). If it is an oversight, add: "Must contain at least one digit (0–9)."

### W3: Special Character Set Is Not Exhaustive
**Section 4** lists special characters with "e.g." prefix: `!@#$%^&*()_+-=[]{}|;:'",.<>?/`. The use of "e.g." introduces ambiguity — does the system accept backticks, tildes, or other non-listed characters? The requirement should either provide the exhaustive list or state "any non-alphanumeric printable ASCII character."

### W4: Concurrent Token Behavior Unspecified
If a user requests multiple resets within the 3-per-hour limit, the BRD does not specify whether **all issued tokens remain valid** or only the **most recent token** is valid (invalidating prior ones). This affects both database design and security posture — if all remain valid, an attacker who intercepts one link retains access even if the user requests a new one.

### W5: SMTP Failure Handling Not Addressed
The BRD does not specify what happens if the Strato SMTP server is unreachable or returns an error when sending the reset email. Should the user still see the generic confirmation message? Should the system retry? Should a failure be logged? This edge case should be defined, even if the answer is "show the same generic message and log the error server-side."

---

## Recommendations

### R1: Specify SMTP Credential Storage
**Section 8** states credentials will be "provided by stakeholder during implementation" but does not specify the storage mechanism. Recommend stating: "SMTP credentials must be stored in environment variables (not in source code)."

### R2: Define Reset URL Format
The BRD does not specify the structure of the reset URL. Recommend defining the pattern, e.g., `{NEXTAUTH_URL}/auth/reset-password?token={token}`, so frontend and backend teams align.

### R3: Add CSRF Protection Note
The password reset request form and the set-new-password form should include CSRF protection. While Next.js server actions have built-in CSRF protection, this is worth explicitly mentioning if API routes are used instead.

### R4: Consider Logging Requirements
The BRD does not mention logging for password reset events (requests, successes, failures, rate limit hits). For security audit trails, recommend adding a note about logging these events server-side.

### R5: Clarify "Silent Redirect" UX Impact
**Section 2.3** specifies silent redirect to login for expired/invalid tokens. While this is a valid security choice (preventing information leakage), it may frustrate users who don't understand why they're on the login page. Consider whether a brief, non-revealing message like "Please request a new password reset link" is acceptable without leaking information.

### R6: Confirm Email Uniqueness Assumption
The BRD implicitly assumes each email maps to exactly one user account. The database schema confirms this (`UNIQUE KEY UQ_USERS_EMAIL`), but the BRD should explicitly state this assumption for completeness.

---

## Approved Requirements Summary

The following requirements are clear, complete, and approved for design:

1. **User Flow** (Section 2): Complete step-by-step flow from login page through reset request, email delivery, link click, and new password submission. All happy-path steps are well-defined.

2. **Security Model** (Section 6): Account enumeration prevention, token hashing, single-use tokens, session invalidation, and rate limiting are all explicitly specified with concrete values.

3. **Rate Limiting** (Section 5): Clear limits (3 per hour per email) with defined behavior when exceeded (same generic message, no email sent).

4. **Password Requirements** (Section 4): Minimum length and character class requirements are defined (with minor clarification needed per W2 and W3).

5. **Token Lifecycle** (Section 3): 1-hour expiry, single-use, hashed storage — all clearly specified.

6. **Email Specifications** (Section 2.2): Sender address, mail server, and content style are defined. No-frills plain text approach is clear.

7. **UI/UX Screens** (Section 7): All screens and their content are enumerated.

8. **Out of Scope** (Section 9): Clear boundaries prevent scope creep.

9. **Database Requirements** (Section 8): New table for password reset tokens with required columns identified.

---

*Audited on 2026-04-17. BRD version: v1.*