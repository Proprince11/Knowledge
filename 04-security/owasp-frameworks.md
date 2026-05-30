---
title: OWASP Frameworks & Web Application Defense
domain: 04 — Offensive/Defensive Security
status: done
depth: graduate
prerequisites: [web fundamentals, http, dbms.md basics]
reading_time: ~40 min
last_updated: 2026-05-29
scope_note: >
  Defensive reference. Each vulnerability class is explained to enable PREVENTION and
  secure coding. No exploit payloads are provided; the focus is root cause and the fix.
---

# OWASP Frameworks & Web Application Defense

OWASP (Open Worldwide Application Security Project) produces the de-facto standards for web
security. The flagship **OWASP Top 10** is a prioritized list of the most critical web
application risks; the **ASVS** is a verification standard; the **WSTG** is the testing guide;
the **Cheat Sheet Series** is the practical fix library. This file maps the major risk classes
to their **root cause and remediation** — the goal is hardening, not exploitation.

---

## 1. Technical Mechanisms (the risk classes & their root causes)

### 1.1 OWASP Top 10 (2021) — defensive summary

| Rank | Category | Root cause | Primary defense |
|---|---|---|---|
| A01 | **Broken Access Control** | missing/weak authorization checks | enforce authz server-side per request; deny by default |
| A02 | **Cryptographic Failures** | weak/missing encryption of data in transit/at rest | TLS everywhere, strong algorithms, proper key mgmt (`cryptography.md`) |
| A03 | **Injection** (SQL, OS, LDAP, XSS) | untrusted data interpreted as code/query | parameterized queries, output encoding, allow-list validation |
| A04 | **Insecure Design** | missing security in architecture | threat modeling, secure design patterns, abuse cases |
| A05 | **Security Misconfiguration** | defaults, verbose errors, open features | hardening baselines, least functionality, secure defaults |
| A06 | **Vulnerable/Outdated Components** | unpatched libraries/frameworks | SCA/SBOM, dependency patching, version pinning + updates |
| A07 | **Identification & Auth Failures** | weak auth/session management | MFA, strong session handling, rate limiting, no default creds |
| A08 | **Software & Data Integrity Failures** | unverified updates/deserialization/CI pipeline | signed artifacts, integrity checks, secure deserialization |
| A09 | **Security Logging & Monitoring Failures** | can't detect/respond | log security events, alerting, tamper-resistant logs |
| A10 | **Server-Side Request Forgery (SSRF)** | server fetches attacker-controlled URLs | allow-list egress, block internal ranges/metadata endpoints |

### 1.2 Injection — the canonical class (and its fix)

Injection happens when **untrusted input is concatenated into an interpreter's command**
(SQL, shell, LDAP). The fix is structural, not filtering:

```python
# VULNERABLE (string concatenation lets input change the query structure):
cur.execute("SELECT * FROM users WHERE email = '" + email + "'")

# SAFE (parameterized query — data can NEVER be interpreted as SQL structure):
cur.execute("SELECT * FROM users WHERE email = %s", (email,))
```

The parameterized form sends the query *structure* and the *data* separately, so input is always
treated as a value. This single pattern eliminates the entire SQL-injection class. (See
`dbms.md`.) For OS commands: avoid shelling out; use library APIs and never pass untrusted input
to a shell.

### 1.3 Cross-Site Scripting (XSS) — output-context encoding

XSS executes attacker script in a victim's browser because untrusted data is rendered without
**context-appropriate output encoding**. Defenses (layered):
- **Output encoding** for the exact context (HTML body, attribute, JS, URL, CSS).
- **Use frameworks that auto-escape** (React/Angular/templating) and avoid `dangerouslySetInnerHTML`
  / `innerHTML` with untrusted data.
- **Content Security Policy (CSP)** as defense-in-depth to limit script sources.
- **Sanitize** rich HTML with a vetted library (e.g., DOMPurify) when you must allow markup.

### 1.4 Broken Access Control — the #1 risk

Two recurring failures:
- **IDOR / BOLA** (Insecure Direct Object Reference / Broken Object-Level Authorization):
  `/api/orders/123` returns *anyone's* order because the server doesn't check the requester owns
  it. **Fix:** verify authorization on *every* object access, server-side, against the
  authenticated principal.
- **Missing function-level authorization:** hiding an admin button but not protecting the admin
  endpoint. **Fix:** enforce role/permission checks on the *endpoint*, deny-by-default.

### 1.5 Authentication, sessions, and CSRF

- **Auth:** MFA, slow adaptive password hashing (`cryptography.md`: bcrypt/scrypt/Argon2), no
  default/weak credentials, account-lockout/rate-limiting, secure password reset.
- **Sessions:** cryptographically-random tokens; `HttpOnly`, `Secure`, `SameSite` cookies;
  rotate on privilege change; sensible expiry.
- **CSRF:** state-changing requests need anti-CSRF tokens and/or `SameSite` cookies so a
  malicious site can't ride the victim's session.

### 1.6 SSRF & the cloud metadata problem

SSRF tricks the *server* into making requests to attacker-chosen destinations — often the cloud
**instance metadata service** (to steal credentials) or internal services. Defenses: egress
allow-listing, block link-local/internal ranges, require IMDSv2-style protections, validate &
canonicalize URLs server-side.

### 1.7 OWASP API Security & LLM Top 10 (modern additions)

- **OWASP API Security Top 10** emphasizes BOLA, broken authentication, and excessive data
  exposure — the dominant issues in API-first architectures.
- **OWASP Top 10 for LLM Applications** covers **prompt injection**, insecure output handling,
  training-data poisoning, and sensitive-information disclosure — essential for anyone shipping
  LLM features (see `../03-computer-science-architecture/llm-fine-tuning.md`).

---

## 2. Application Frameworks

### 2.1 Secure SDLC: shift left

```
DESIGN     threat modeling (STRIDE), security requirements, abuse cases
DEVELOP    secure coding standards, input validation, output encoding, parameterization
BUILD/CI   SAST (static analysis), SCA (dependency scanning), secret scanning, IaC scanning
TEST       DAST (dynamic), pentest, fuzzing
DEPLOY     hardened config, secrets management, least privilege
OPERATE    logging/monitoring, WAF, patching, incident response
```

> **Principle:** the earlier a flaw is caught, the cheaper the fix. Bake security gates into CI
> rather than bolting on a pentest at the end.

### 2.2 Input validation & the trust boundary

- **Validate at the trust boundary**, allow-list (define what's valid) rather than deny-list
  (chase what's bad).
- **Validation ≠ output encoding** — you need *both*: validate on input, encode on output for the
  destination context.
- Treat *all* external input as hostile: query params, headers, cookies, file uploads,
  third-party API responses, and (for LLM apps) model inputs/outputs.

### 2.3 Threat modeling with STRIDE

| Threat | Property violated | Example control |
|---|---|---|
| **S**poofing | authentication | MFA, strong identity |
| **T**ampering | integrity | signatures, hashes, input validation |
| **R**epudiation | non-repudiation | audit logs |
| **I**nformation disclosure | confidentiality | encryption, access control |
| **D**enial of service | availability | rate limiting, autoscaling, quotas |
| **E**levation of privilege | authorization | least privilege, authz checks |

### 2.4 Using OWASP resources concretely

- **ASVS** (Application Security Verification Standard): a checklist of requirements by assurance
  level — use it to *define* and *verify* security requirements.
- **Cheat Sheet Series:** the go-to for "how do I securely do X" (auth, session, password
  storage, CSRF, etc.).
- **Dependency-Check / SCA + SBOM:** continuously track and patch vulnerable components (A06).
- **WSTG:** the structured testing methodology to verify the above.

---

## 3. Common Pitfalls

1. **Deny-list filtering for injection/XSS.** Always bypassable; use parameterization + output
   encoding + allow-listing.
2. **Client-side-only validation/authorization.** Attackers bypass the client; enforce
   server-side.
3. **IDOR/BOLA.** Object access without ownership checks — the most common serious API bug.
4. **Trusting hidden UI as access control.** Hiding a button isn't protecting the endpoint.
5. **Rolling your own crypto/auth.** Use vetted libraries and standards (`cryptography.md`).
6. **Verbose error messages / stack traces** leaking internals in production.
7. **Unpatched dependencies** (A06) — often the actual breach vector; automate SCA.
8. **No security logging/monitoring (A09).** Breaches go undetected for months.
9. **Secrets in code/repos.** Use a secrets manager; scan for leaked credentials.
10. **Ignoring SSRF / cloud metadata exposure** in services that fetch URLs.
11. **Treating an LLM's output as trusted** — prompt injection and insecure output handling are
    real (OWASP LLM Top 10).

---

## 4. Advanced Resources

**OWASP (primary)**
- OWASP Top 10: <https://owasp.org/www-project-top-ten/>
- API Security Top 10: <https://owasp.org/www-project-api-security/>
- Top 10 for LLM Applications: <https://owasp.org/www-project-top-10-for-large-language-model-applications/>
- ASVS: <https://owasp.org/www-project-application-security-verification-standard/>
- Cheat Sheet Series: <https://cheatsheetseries.owasp.org/>
- Web Security Testing Guide: <https://owasp.org/www-project-web-security-testing-guide/>

**Practical learning (legal)**
- PortSwigger Web Security Academy: <https://portswigger.net/web-security>
- OWASP Juice Shop / WebGoat (run isolated locally).

**Standards**
- NIST Secure Software Development Framework (SSDF, SP 800-218).

---

### Cross-references
- `pentesting-methodology.md` — how these classes are tested for.
- `cryptography.md` — A02 cryptographic failures, password storage.
- `network-defense.md` — WAF, logging/monitoring (A09), defense-in-depth.
- `../03-computer-science-architecture/dbms.md` — parameterized queries (injection fix).
- `../03-computer-science-architecture/llm-fine-tuning.md` — LLM application security.
