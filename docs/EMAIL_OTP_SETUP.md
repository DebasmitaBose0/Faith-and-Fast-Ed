# Email & OTP Setup (Brevo)

Faith AND Fast uses [Brevo](https://www.brevo.com/) (formerly Sendinblue) to send
transactional emails: the registration OTP, password-reset OTP, and account-status
notifications. This guide covers the configuration required for reliable delivery.

## 1. Required environment variables

Add these to your server `.env` file:

| Variable               | Required | Default                    | Description                                                                   |
| ---------------------- | -------- | -------------------------- | ----------------------------------------------------------------------------- |
| `BREVO_API_KEY`        | **Yes**  | —                          | Brevo transactional API key (`xkeysib-...`). Without it, all OTP emails fail. |
| `BREVO_SENDER_EMAIL`   | No       | `support@faithandfast.com` | The "from" address. **Must be a verified sender in Brevo** (see step 2).      |
| `BREVO_SENDER_NAME`    | No       | `Faith AND Fast`           | Display name shown to recipients.                                             |
| `EMAIL_MAX_RETRIES`    | No       | `2`                        | How many times to attempt each send before giving up.                         |
| `EMAIL_RETRY_DELAY_MS` | No       | `1000`                     | Delay (ms) between retry attempts.                                            |

On startup, the server logs a clear error if `BREVO_API_KEY` is missing, so
misconfiguration is caught immediately instead of failing silently at registration.

## 2. Verify your sender in Brevo

Brevo rejects emails sent from unverified senders — this is the most common cause of
"OTP not received."

1. Sign in to Brevo → **Settings → Senders, Domains & Dedicated IPs**.
2. Add and verify the email address you set as `BREVO_SENDER_EMAIL` (or verify your
   whole sending domain via DNS for best deliverability).
3. Confirm the status shows **Verified** before going live.

## 3. Get your API key

Brevo → **Settings → SMTP & API → API Keys → Generate a new API key**. Copy it into
`BREVO_API_KEY`. Treat it as a secret — never commit it.

## 4. How the OTP flow works

**Registration**

1. User submits the signup form.
2. The server generates a 6-digit OTP (15-minute expiry), emails it, and creates the
   account with `verifyEmail: false`. No login token is issued yet.
3. The client routes the user to `/verify-email`.
4. User enters the OTP; on success `verifyEmail` is set to `true` and they can log in.

**Password reset** uses the same email service with a separate 10-minute OTP.

## 5. Reliability & logging

- Each send is retried up to `EMAIL_MAX_RETRIES` times on transient failure.
- Every attempt logs the recipient, subject, and (on failure) the underlying Brevo
  error detail, e.g.:
  ```
  [email] Sent "Verify Your Email - Faith AND Fast" to user@example.com (attempt 1).
  [email] Failed to send "..." to user@example.com (attempt 1/2): <Brevo error>
  ```

## 6. Troubleshooting

| Symptom                                 | Likely cause         | Fix                                           |
| --------------------------------------- | -------------------- | --------------------------------------------- |
| Startup log: `BREVO_API_KEY is not set` | Missing env var      | Set `BREVO_API_KEY` and restart               |
| `401`/unauthorized in email logs        | Invalid API key      | Regenerate the key in Brevo                   |
| Sends succeed but mail never arrives    | Unverified sender    | Verify `BREVO_SENDER_EMAIL` in Brevo (step 2) |
| OTP arrives but verification fails      | OTP expired (15 min) | Use **Resend OTP** on the verify page         |
