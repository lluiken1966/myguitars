# Business Requirements Document: Password Forgotten Functionality

## 1. Overview

Add a "Forgot Password" feature to MyGuitars that allows users to reset their password via an email link. The reset link is sent to the user's registered email address using Strato SMTP and expires after 1 hour.

## 2. User Flow

### 2.1 Requesting a Password Reset
1. User navigates to the **login page**.
2. User clicks the **"Forgot Password?" link**, located directly below or near the password field.
3. User is taken to a **password reset request page** where they enter their **email address** (no other fields required).
4. User submits the form.
5. A **generic confirmation message** is displayed regardless of whether the email exists in the system:
   > *"If an account with that email exists, we've sent a password reset link."*
6. If the email matches a registered account, a reset email is sent.

### 2.2 Reset Email
- **Sender address**: `noreply@walidoka.nl`
- **Mail server**: Strato SMTP (credentials to be provided by stakeholder during implementation)
- **Email content**: Plain and simple — brief message with the reset link. No branding, logo, or HTML styling.
- **No confirmation email** is sent after a successful password change.

### 2.3 Clicking the Reset Link
1. User clicks the reset link in their email.
2. If the link is **valid and not expired**, the user is taken to a **"Set New Password" page** with:
   - New password field
   - Confirm password field
3. If the link is **expired, already used, or invalid**, the user is **silently redirected to the login page** without any error message.

### 2.4 Setting a New Password
1. User enters and confirms their new password.
2. Password must meet the following requirements (see Section 4).
3. On successful submission:
   - Password is updated in the database.
   - **All existing sessions for the user are invalidated** (user is logged out everywhere).
   - The reset token is **consumed** (single-use — cannot be reused).
   - User is **redirected to the login page** with a success message.

## 3. Reset Link Specifications

| Property | Value |
|---|---|
| **Expiry** | 1 hour from time of creation |
| **Single-use** | Yes — once used successfully, the link is invalidated immediately, even if the 1-hour window has not elapsed |
| **Token storage** | Secure, hashed token stored in the database |

## 4. Password Requirements

New passwords must meet **all** of the following criteria:

- Minimum **8 characters** in length
- Must contain at least one **uppercase** letter (A–Z)
- Must contain at least one **lowercase** letter (a–z)
- Must contain at least one **special character** (e.g., `!@#$%^&*()_+-=[]{}|;:'",.<>?/`)

## 5. Rate Limiting

| Rule | Value |
|---|---|
| **Max reset requests per email** | 3 per hour |
| **Behavior when limit exceeded** | Same generic confirmation message is shown (no indication that the limit was hit), but no email is sent |

## 6. Security Requirements

- **Account enumeration prevention**: The same generic message is displayed whether or not the email exists in the system.
- **Token hashing**: Reset tokens must be stored as hashed values in the database (not plaintext).
- **Single-use tokens**: Tokens are invalidated immediately after successful password reset.
- **Session invalidation**: All active sessions for the user are invalidated upon successful password change.
- **Rate limiting**: Max 3 requests per hour per email to prevent abuse.
- **Expired/invalid tokens**: Silent redirect to login page — no information leakage.

## 7. UI / UX Summary

| Screen | Details |
|---|---|
| **Login page** | Add "Forgot Password?" link near the password field |
| **Request reset page** | Single input field for email address + submit button |
| **Confirmation** | Generic message: "If an account with that email exists, we've sent a password reset link." |
| **Set new password page** | New password + confirm password fields with validation |
| **Success** | Redirect to login page with success message |
| **Expired/invalid link** | Silent redirect to login page (no message) |

## 8. Technical Notes

- **Mail server**: Strato SMTP — account credentials to be provided by stakeholder during implementation phase.
- **Sender**: `noreply@walidoka.nl`
- **Token expiry**: 1 hour TTL, stored with creation timestamp in the database.
- **Integration**: Fits within the existing NextAuth credentials-based authentication system.
- A new database table will be needed for storing password reset tokens (token hash, user ID, creation timestamp, used/expired flag).

## 9. Out of Scope

- Branded/styled email templates
- Password change confirmation email
- "Request new link" option on expired link pages
- Account lockout after failed reset attempts
