import Sib from 'sib-api-v3-sdk';
import dotenv from 'dotenv';
dotenv.config();

// Sender + retry behaviour are configurable via environment variables, with
// sensible defaults so existing deployments keep working unchanged.
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Faith AND Fast';
const MAX_RETRIES = Number(process.env.EMAIL_MAX_RETRIES) || 5;
const RETRY_DELAY_MS = Number(process.env.EMAIL_RETRY_DELAY_MS) || 1000;

// Validate required configuration at startup so a missing key fails loudly here
// instead of silently breaking OTP delivery when a user tries to register.
if (!process.env.BREVO_API_KEY) {
  console.error(
    '[email] BREVO_API_KEY is not set. Email verification and password-reset ' +
      'emails will fail. Set BREVO_API_KEY in your environment ' +
      '(see docs/EMAIL_OTP_SETUP.md).'
  );
}

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends a transactional email through Brevo.
 *
 * Returns `true` on success and `false` on failure — callers (registerUser,
 * verifyEmailOtp, resendOtp, ...) rely on this boolean contract.
 *
 * Transient failures are retried, and every failed attempt is logged with the
 * recipient, subject, and the underlying Brevo error detail so delivery
 * problems are visible in server logs instead of disappearing silently.
 */
const sendEmail = async ({ sendTo, subject, html }) => {
  if (!process.env.BREVO_API_KEY) {
    console.error(
      `[email] Cannot send "${subject}" to ${sendTo}: BREVO_API_KEY is missing.`
    );
    return false;
  }

  if (!sendTo) {
    console.error(`[email] Cannot send "${subject}": no recipient provided.`);
    return false;
  }

  const tranEmailApi = new Sib.TransactionalEmailsApi();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await tranEmailApi.sendTransacEmail({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email: sendTo }],
        subject,
        htmlContent: html,
      });

      console.log(
        `[email] Sent "${subject}" to ${sendTo} (attempt ${attempt}).`
      );
      return true;
    } catch (error) {
      // Brevo surfaces useful detail on error.response.body / .text.
      const detail =
        error?.response?.body ||
        error?.response?.text ||
        error?.message ||
        error;
      console.error(
        `[email] Failed to send "${subject}" to ${sendTo} ` +
          `(attempt ${attempt}/${MAX_RETRIES}):`,
        detail
      );

      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS);
      }
    }
  }

  console.error(
    `[email] Giving up on "${subject}" to ${sendTo} after ${MAX_RETRIES} attempts.`
  );
  return false;
};

export default sendEmail;
