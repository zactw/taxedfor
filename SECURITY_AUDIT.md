# TaxedFor Security Audit

**Date:** 2026-03-20  
**Auditor:** Jarvis (AI Security Audit)  
**Scope:** `/Users/jarvis/.openclaw/workspace/taxedfor` — Next.js W2 analyzer app  
**Status:** ✅ All High/Critical issues resolved

---

## Executive Summary

TaxedFor is a Next.js application that accepts W2 document uploads, sends them to the Anthropic API for tax data extraction, and displays a breakdown of federal tax allocation. The app is architecturally well-structured (no client-side API key exposure, no persistent storage), but several important security hardening measures were missing pre-audit.

**5 vulnerabilities fixed. 0 critical, 3 high, 1 medium, 1 low.**

No dependency vulnerabilities (`npm audit` returned 0 findings).

---

## Findings & Fixes

| # | Severity | Area | Finding | Status |
|---|----------|------|---------|--------|
| 1 | **High** | API Security | No rate limiting — API key could be drained by bot | ✅ Fixed |
| 2 | **High** | File Upload | No server-side file size limit (DoS via large uploads) | ✅ Fixed |
| 3 | **High** | File Upload | No magic byte validation (MIME type spoofing possible) | ✅ Fixed |
| 4 | **Medium** | HTTP Headers | Missing security headers (CSP, HSTS, X-Frame-Options, etc.) | ✅ Fixed |
| 5 | **Low** | Error Handling | Internal error messages leaked to client (stack trace/message) | ✅ Fixed |
| 6 | **Info** | Dependencies | `npm audit` — 0 known vulnerabilities | ✅ No action needed |
| 7 | **Info** | Env Vars | `ANTHROPIC_API_KEY` in `.env.local`, properly gitignored | ✅ No action needed |
| 8 | **Info** | Client-side | API key not referenced in any client component | ✅ No action needed |
| 9 | **Info** | Data Storage | No user data persisted; W2 processed in-memory only | ✅ By design |

---

## Detailed Findings

### 1. [HIGH] No Rate Limiting — API Key Drain Risk
**File:** `app/api/analyze/route.ts`  
**Risk:** Any bot could send thousands of requests/minute to drain the Anthropic API key with no friction.  
**Fix:** Implemented a sliding-window in-memory rate limiter: **10 requests per IP per 60 seconds**.  
Returns HTTP 429 with `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers.  
Stale entries are periodically cleaned up to prevent unbounded memory growth.

### 2. [HIGH] No File Size Limit — DoS Risk
**File:** `app/api/analyze/route.ts`  
**Risk:** An attacker could upload a multi-gigabyte file, consuming server memory and blocking the process.  
**Fix:** Added a **10 MB maximum** file size check before reading the file buffer. Returns HTTP 413 if exceeded. Also validates that the file is not 0 bytes.

### 3. [HIGH] No Magic Byte Validation — MIME Spoofing
**File:** `app/api/analyze/route.ts`  
**Risk:** Client could send a file with `Content-Type: image/jpeg` that is actually a different format or executable. Server-side code only checked the declared MIME type.  
**Fix:** Implemented **magic byte signature validation** for all supported file types (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, WebP: `52 49 46 46...57 45 42 50`, GIF: `47 49 46`, PDF: `25 50 44 46`). File is rejected if bytes don't match declared MIME type.

### 4. [MEDIUM] Missing HTTP Security Headers
**File:** `next.config.ts`  
**Risk:** Without security headers, the app is vulnerable to clickjacking, MIME sniffing, information leakage, and lacks HSTS enforcement.  
**Fix:** Added the following headers to all routes via `async headers()` in `next.config.ts`:
- `X-Frame-Options: SAMEORIGIN` — clickjacking protection
- `X-Content-Type-Options: nosniff` — MIME sniffing protection
- `X-XSS-Protection: 1; mode=block` — legacy XSS filter
- `Referrer-Policy: strict-origin-when-cross-origin` — limits referrer leakage
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` — enforces HTTPS
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — disables unused browser APIs
- `Content-Security-Policy` — restricts resource loading to self + Google Fonts

### 5. [LOW] Internal Error Messages Leaked to Client
**File:** `app/api/analyze/route.ts`  
**Risk:** The catch block previously returned `err.message` directly — which could expose internal paths, library names, or stack details to the client.  
**Fix:** The catch block now returns a generic `"An error occurred processing your request."` message to the client, while logging internally (without PII) for debugging. PDF errors return user-safe messages. Claude parse failures don't log the AI response (which may contain W2 PII).

---

## What Was Fixed (Summary)

```
next.config.ts          — Security headers added (CSP, HSTS, X-Frame, X-Content-Type, Referrer, Permissions)
app/api/analyze/route.ts — Rate limiting (10 req/min/IP with cleanup)
                         — File size limit (10 MB max, 0 bytes rejected)
                         — Magic byte signature validation
                         — Sanitized error responses (no internals leaked)
                         — Output bounds validation (dollars capped at $999,999)
                         — State code regex validation (/^[A-Z]{2}$/)
                         — Rate limit headers in response
```

---

## Still Needs Attention (Requires External Services)

### Production-Scale Rate Limiting
The current in-memory rate limiter works for **single-instance** deployments only. On Vercel or multi-instance deployments, each instance has its own memory — a client could hit 10 different instances and bypass the limit.

**Recommendation:** Replace with Redis-backed rate limiting using [@upstash/ratelimit](https://github.com/upstash/ratelimit):
```bash
npm install @upstash/ratelimit @upstash/redis
```
Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in environment.

### Content-Security-Policy Nonces
The current CSP includes `'unsafe-inline'` for scripts (required by Next.js dev mode). For production:
- Use `nonces` via Next.js middleware to tighten CSP
- Remove `'unsafe-eval'` after confirming it's not needed in production build

### HTTPS / TLS
HSTS is set but only effective after first HTTPS visit. Ensure:
- DNS is HTTPS-only (Vercel handles this automatically)
- No HTTP redirect loops

---

## SOC2 Readiness Assessment

| Control | Status | Notes |
|---------|--------|-------|
| **Data Minimization** | ✅ Pass | Only tax withholding fields extracted; no name, SSN, employer data returned |
| **Data Retention** | ✅ Pass | No user data stored; W2 processed in-memory, not written to disk |
| **Access Control** | ⚠️ Partial | Rate limiting in place; no auth layer (public app by design) |
| **Encryption in Transit** | ✅ Pass | HSTS header added; Vercel enforces TLS |
| **Audit Logging** | ⚠️ Partial | Errors logged server-side; no structured access logging |
| **Vulnerability Management** | ✅ Pass | `npm audit`: 0 findings; no outdated critical deps |
| **Secrets Management** | ✅ Pass | API key in `.env.local`, gitignored; not exposed client-side |
| **Sensitive Data Logging** | ✅ Pass | AI response (containing W2 data) not logged |
| **Error Handling** | ✅ Pass | Internal errors not exposed to client |

**Overall: Good foundation.** Not yet SOC2-certified but has the right controls for a public-facing hobby/production app.

---

## Recommendations for Production Hardening

1. **Redis rate limiting** — replace in-memory with Upstash for multi-instance deployments
2. **CSP nonces** — tighten Content-Security-Policy in production by removing `unsafe-inline`
3. **Request logging** — add structured access logs (IP, timestamp, status) for audit trail
4. **Dependency updates** — set up Dependabot or `npm audit` in CI pipeline
5. **API key rotation** — rotate `ANTHROPIC_API_KEY` if it was ever committed to git history
6. **CORS policy** — if this becomes an API used by third parties, add explicit CORS restrictions
7. **Input length limits** — consider a server-side body size limit in Next.js config (`experimental.serverBodySizeLimit`)
