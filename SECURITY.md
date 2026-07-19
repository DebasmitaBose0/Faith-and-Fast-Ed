# Security Policy

## Supported Versions

Only the latest stable release receives security patches. Older versions are not supported and should be upgraded immediately.

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅        |
| < 1.0   | ❌        |

## Threat Model & Scope

Faith & Fast is an e-commerce platform handling user authentication, payments via Stripe, and image uploads via Cloudinary. The following are in scope:

- Cross-Site Scripting (XSS) and injection vulnerabilities
- Authentication & session management flaws
- Insecure direct object references (IDOR)
- Server-Side Request Forgery (SSRF)
- Payment flow manipulation
- Sensitive data exposure (PII, tokens, secrets)
- Business logic abuse (discount/pricing manipulation)

Out of scope: Social engineering, denial-of-service attacks, and vulnerabilities in third-party dependencies already disclosed upstream.

## Reporting a Vulnerability

We take the security of our users seriously. If you believe you have found a security vulnerability, please **do not** open a public issue. Instead, follow the responsible disclosure process below:

### Disclosure Process

1. **Report** — Email your findings to `security@faith-and-fast.example.com` with the subject `[Security] <brief-description>`. Include:
   - A clear description of the vulnerability
   - Steps to reproduce (minimal, self-contained)
   - Proof of concept (if applicable)
   - Your suggested impact assessment

2. **Acknowledgment** — We will acknowledge receipt within **48 hours** and begin triage.

3. **Assessment** — Our security team will validate and categorize the issue (Critical, High, Medium, Low). We may reach out for clarification.

4. **Resolution** — We aim to issue a fix within:
   - **Critical**: 48 hours
   - **High**: 5 business days
   - **Medium/Low**: Next release cycle

5. **Disclosure** — Once fixed, we will publish a security advisory and (with your permission) credit you as the discoverer.

### PGP Encryption

If your report contains sensitive information, you may encrypt it using our PGP key:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
# Request our PGP key by email if needed.
-----END PGP PUBLIC KEY BLOCK-----
```

### Hall of Fame

We maintain a Hall of Fame for researchers who responsibly disclose vulnerabilities. If you would like to be credited, let us know when you submit your report.

## Security Headers

This project implements the following HTTP security headers via Helmet middleware:

| Header | Value |
| ------ | ----- |
| `Content-Security-Policy` | Restrictive CSP (see middleware/security.js) |
| `Strict-Transport-Security` | 2 years, includeSubDomains, preload |
| `X-Content-Type-Options` | nosniff |
| `X-Frame-Options` | DENY |
| `X-XSS-Protection` | 1; mode=block |
| `Referrer-Policy` | strict-origin-when-cross-origin |
| `Permissions-Policy` | camera=(), microphone=(), geolocation=(), payment=(self) |
| `Cross-Origin-Opener-Policy` | same-origin |

## Dependency Management

Dependencies are audited regularly. Known vulnerabilities are tracked via `npm audit` and patched in the next release. For critical CVEs, hotfixes are released outside the normal schedule.

---

*This policy is maintained by the Faith & Fast security team. Last updated: 2026-07-08.*
