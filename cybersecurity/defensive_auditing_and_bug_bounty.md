# Defensive Auditing & Bug Bounty Playbook

> **Audience:** Authorized security auditors, blue/purple-team engineers, and bug bounty
> researchers operating strictly within an in-scope program or signed Rules of Engagement (RoE).
>
> **Frame:** Every technique below is presented from a *defensive* and *educational* point of
> view. The goal is not to break things — it is to (1) discover assets your organization has
> forgotten about, (2) prove a defect can be exploited so it gets prioritized, and
> (3) document remediation so the same class of bug never returns.
>
> **Authorization is non-negotiable.** Before running a single command against any host you
> do not personally own, confirm:
>
> 1. The target is explicitly listed in a **public bug bounty scope** (HackerOne, Bugcrowd,
>    Intigriti, Yeswehack, or vendor VDP), **or**
> 2. You hold a **signed Statement of Work / Master Services Agreement** with the asset owner.
> 3. You have re-read the **out-of-scope** list (often: PII exfiltration, DoS, social
>    engineering of staff, physical, automated scanners against production payment paths).
>
> When in doubt, do not test. A good finding reported late is infinitely better than a great
> finding reported from a jail cell.

---

## Table of Contents

1. [Lab Setup & Operational Hygiene](#1-lab-setup--operational-hygiene)
2. [Passive Reconnaissance](#2-passive-reconnaissance)
3. [Active Reconnaissance](#3-active-reconnaissance)
4. [OWASP Top 10 Deep Dive — SQL Injection](#4-owasp-top-10--sql-injection)
5. [OWASP Top 10 Deep Dive — Cross-Site Scripting](#5-owasp-top-10--cross-site-scripting-xss)
6. [OWASP Top 10 Deep Dive — Broken Authentication](#6-owasp-top-10--broken-authentication--session-mgmt)
7. [Bug Bounty Automation Workflows](#7-bug-bounty-automation-workflows)
8. [Secrets, Open Directories & Cloud Bucket Misconfigurations](#8-secrets-open-directories--cloud-bucket-misconfigurations)
9. [Reporting, Triage & Remediation Loops](#9-reporting-triage--remediation-loops)
10. [Appendix: Reference Wordlists, Tools, Cheatsheet](#10-appendix)

---

## 1. Lab Setup & Operational Hygiene

A professional auditor isolates their tooling. **Never** run recon from your daily-driver IP
or laptop. Targets log everything; some retaliate by feeding poisoned responses, and many
WAFs auto-block IPs they decide are "scanners," which can ruin your ability to verify
findings later.

### 1.1 Recommended baseline workstation

| Layer            | Choice                              | Why                                                               |
|------------------|-------------------------------------|-------------------------------------------------------------------|
| Host OS          | Up-to-date Linux (Debian/Ubuntu)    | Predictable package management, broad tool support                |
| Test environment | Disposable VM (Kali / ParrotOS)     | Snapshots; isolate from personal data                             |
| Network egress   | Dedicated VPS or VPN (with consent) | Stable source IP you can disclose to the program if asked         |
| Browser          | Hardened Firefox + Burp profile     | Separate cookie jar from personal browsing                        |
| Note-taking      | Obsidian / Joplin (encrypted vault) | Per-target notebook keeps scope, creds, evidence linked           |
| Time-keeping     | `script` + `asciinema`              | Replayable session logs are gold for reports and disputes         |

### 1.2 Per-engagement folder template

```text
~/engagements/<program-or-client>/<YYYY-MM-DD>/
├── 00-scope/         # signed RoE, scope.txt, out-of-scope.txt
├── 01-recon/
│   ├── passive/
│   └── active/
├── 02-findings/
│   └── <FINDING-ID>/  evidence.png, request.http, response.http, poc.py
├── 03-reports/        # final markdown/PDF deliverables
└── 04-cleanup.md      # what was created on target & how it was removed
```

The `04-cleanup.md` file is the single most under-appreciated artifact in the industry.
Track every test account, uploaded file, ticket, comment, or stored XSS payload you placed
on the target so you (or the vendor) can remove it after reporting.

### 1.3 Operational rules of thumb

* **Rate-limit yourself.** A scanner running at 5,000 req/sec is indistinguishable from a
  DoS attempt to the SOC analyst on the other side. Default to ≤ 10 rps unless the program
  explicitly allows more.
* **Identify your traffic.** Set a custom User-Agent (e.g. `BBR-jdoe/1.0
  contact:jdoe@example.com`). Many programs require this and it lets defenders allowlist you.
* **Never test in production-payment, healthcare records, or kill-chain admin paths**
  unless the scope explicitly invites it.
* **Keep findings confidential** until the vendor authorizes disclosure (typically 90 days
  or after fix).

---

## 2. Passive Reconnaissance

Passive recon generates **zero packets** to the target. You query third-party datasets that
already crawl, mirror, and index the internet. This is the safest phase and often produces
the highest-impact findings (forgotten staging sites, exposed S3 buckets in old commits, leaked
internal hostnames in mobile apps).

### 2.1 The information funnel

```
Seed → Org/People → Domains → Subdomains → IPs/ASNs → Tech stack → Code/Secrets
```

### 2.2 Source catalog

| Source                            | What you get                                        | Example query                                          |
|-----------------------------------|-----------------------------------------------------|--------------------------------------------------------|
| **WHOIS / RDAP**                  | Registrant, registrar, name servers, dates          | `whois example.com`                                    |
| **Certificate Transparency**      | Every TLS cert ever issued (subdomains)             | `crt.sh?q=%25.example.com`                             |
| **Reverse-DNS / PTR datasets**    | Hosts sharing IP space                              | SecurityTrails, Shodan, Censys                         |
| **Search engines (Google dorks)** | Indexed exposures                                   | `site:example.com inurl:admin`                         |
| **Wayback Machine / CommonCrawl** | Old endpoints, deprecated APIs                      | `web.archive.org/web/*/example.com/*`                  |
| **GitHub / GitLab code search**   | Hard-coded creds, internal paths, dev URLs          | `"example.com" password`                              |
| **Public S3/GCS indexes**         | Open buckets named after the org                    | `grayhatwarfare`, `buckets.grayhatwarfare.com`        |
| **PyPI / npm / DockerHub**        | Internal packages mistakenly published              | `npm search @example`                                  |
| **Mobile app stores**             | Endpoints baked into APKs/IPAs                      | `apkpure`, `appstore`, then `apktool` locally          |

### 2.3 Useful Google / Bing dorks (run them by hand, slowly)

```text
site:target.com inurl:(admin | login | dashboard | wp-admin)
site:target.com filetype:(pdf | xls | xlsx | doc | docx | sql | env | log | bak)
site:target.com intitle:"index of"
site:s3.amazonaws.com  target
site:pastebin.com      target.com
site:github.com        "target.com" (password | api_key | token | secret)
"target.com"           inurl:swagger
"target.com"           inurl:.git
```

> **Why dorks first?** Anything Google has indexed is already public. Documenting it costs
> nothing and is impossible to mis-frame as "unauthorized access."

### 2.4 Subdomain harvesting from passive sources

The richest passive sources for subdomains are CT logs, threat-intel feeds, and DNS history
providers. Aggregating them gives you a near-complete picture without one DNS query against
the target.

```bash
# subfinder uses ~30 passive sources by default; add API keys in ~/.config/subfinder/
subfinder -d target.com -all -silent -o passive_subs.txt

# amass passive-only
amass enum -passive -d target.com -o amass_passive.txt

# crt.sh fallback (no API key needed)
curl -s "https://crt.sh/?q=%25.target.com&output=json" \
  | jq -r '.[].name_value' | sed 's/\*\.//g' | sort -u > crt_subs.txt

# Merge & dedupe
sort -u passive_subs.txt amass_passive.txt crt_subs.txt > all_passive_subs.txt
wc -l all_passive_subs.txt
```

### 2.5 GitHub recon — the highest-paying passive activity

Developers leak credentials. Pre-built scanners now do most of the heavy lifting:

```bash
# trufflehog v3 — verifies leaked creds against the live API (read-only verification)
trufflehog github --org=target-org --only-verified --json > tf_results.json

# gitleaks — fast regex-based, runs against an org or a single repo
gitleaks detect --source . --report-format sarif --report-path gitleaks.sarif
```

When trufflehog flags a credential as `verified: true` it has confirmed the secret is live.
**Stop**, document, and report it. Do **not** explore what the credential can access.

> **Defensive lens:** a blue-team org should run `trufflehog` and `gitleaks` inside CI as
> pre-commit + pre-push hooks plus a nightly org-wide sweep. A finding from a researcher is
> a control failure that should trigger this pipeline being added, not just a credential
> rotation.

---

## 3. Active Reconnaissance

Active recon sends packets to the target. Everything in this section must be inside an
authorized scope. Throughout, prefer **slow & complete** over **fast & noisy**.

### 3.1 Subdomain enumeration (active)

After passive recon, resolve every candidate and probe live web services.

```bash
# 1. Resolve to A/AAAA records, dropping wildcards
dnsx -l all_passive_subs.txt -resp -a -aaaa -silent -o resolved.txt

# 2. Brute-force additional names with a curated wordlist
puredns bruteforce assets-2024.txt target.com \
        -r resolvers-trusted.txt --rate-limit 200 -q -w bruteforced.txt

# 3. Permutation discovery (api → api-v2, api.dev, api-staging…)
gotator -sub all_subs.txt -perm permutations.txt -depth 1 -numbers 3 -mindup \
  | puredns resolve -r resolvers-trusted.txt -q > permuted_resolved.txt

# 4. Probe HTTP(S), capture status, title, tech stack, screenshots
httpx -l all_resolved.txt -sc -title -tech-detect -ip -cname \
      -screenshot -srd screenshots/ -json -o httpx.json
```

A *trusted resolver list* (≈10 well-known public resolvers verified to not poison results)
is critical — bad resolvers cause wildcard false positives that pollute the rest of the
pipeline. Maintain it like you maintain a wordlist.

### 3.2 Port scanning protocols

Run the **fast pass** to discover open ports, then the **slow & accurate pass** for service
detection. Two-stage scanning preserves bandwidth and reduces target load.

```bash
# Stage 1 — masscan / naabu: discover open TCP ports across the IP set
naabu -list resolved_ips.txt -top-ports 1000 -rate 1000 -o open_ports.txt

# Stage 2 — nmap: service & version detection on the discovered ports only
nmap -iL open_ports.targets        \
     -Pn -n                        \
     -sV -sC                       \
     --version-intensity 5         \
     -p $(awk -F: '{print $2}' open_ports.txt | sort -u | paste -sd, -) \
     --max-retries 2 --max-rate 300 \
     -oA nmap_full
```

Practical port-scan etiquette:

* Use `-Pn` (skip host discovery) on cloud-hosted assets; ICMP is often blocked and the
  default Nmap host-discovery probes look like reconnaissance to NSGs.
* Cap with `--max-rate` to avoid tripping AWS Shield / Cloudflare rate-based rules.
* For UDP, scan only the top-50 (`-sU --top-ports 50`) — UDP scanning is slow and noisy.
* Never run `--script vuln` or `safe` NSE categories without checking that the program
  permits "active vulnerability scanning".

### 3.3 Technology stack fingerprinting

Knowing the stack drives every later test (a Spring Boot app has different injection
classes than a Rails app).

```bash
# httpx already gives you tech-detect; cross-reference with WhatWeb for richer fingerprints
whatweb -i live_hosts.txt --log-json=whatweb.json --max-threads=10 -a 3

# nuclei tech-detect templates (very low-noise, signature-based)
nuclei -l live_hosts.txt -t http/technologies/ -severity info -j -o tech.json

# Wappalyzer CLI for SPA-heavy targets that hide tech in JS bundles
wappalyzer --recursive --max-urls=50 https://app.target.com > wapp.json
```

Cross-correlate: if `httpx` and `nuclei` both report Apache 2.4.49 you should immediately
check whether the program scope allows verifying CVE-2021-41773 (path traversal). The chain
*recon → known-vuln-mapping → safe PoC* is exactly how high-quality reports are built.

### 3.4 Content discovery

Once you have the live hosts and tech stack, enumerate paths. Use **stack-aware** wordlists
(don't fuzz `/wp-admin` against a Django app).

```bash
ffuf -u https://app.target.com/FUZZ \
     -w wordlists/raft-large-words.txt \
     -mc all -fc 404,403 \
     -ac -of json -o ffuf_app.json \
     -H "User-Agent: BBR-jdoe contact:jdoe@example.com" \
     -rate 30 -t 20
```

Flags worth understanding:

* `-mc all -fc 404,403` — match all status codes, then filter the obvious dead-ends.
* `-ac` (auto-calibrate) — learns the size/word/line patterns of "soft 404s" so they
  don't pollute the results.
* `-rate 30` — be a guest, not a tornado.

---

## 4. OWASP Top 10 — SQL Injection

> **Modern reality:** most "SQLi" today is **second-order** (data flows through a queue or
> background job before being concatenated into SQL) or hides inside an ORM that someone
> circumvented with a raw string. The detection mindset must therefore be *follow the data*,
> not *fuzz the parameter*.

### 4.1 Where to look

| Surface                          | Why it's frequently vulnerable                                  |
|----------------------------------|-----------------------------------------------------------------|
| Search / filter / sort endpoints | Devs concatenate `ORDER BY` because `?` placeholders forbid identifiers |
| Reporting / export endpoints     | Built fast, often raw SQL, almost always behind auth (less reviewed) |
| Legacy `/api/v1/*`               | Pre-ORM era; lives on for backwards compatibility               |
| Admin internal tools             | Built by one engineer, never code-reviewed                      |
| Third-party plugins / CMS modules | Marketplace code, lower bar                                     |

### 4.2 Detection methodology (manual first)

1. **Map every parameter** — query string, body (JSON, form, XML, GraphQL), headers
   (`X-Forwarded-For`, `User-Agent`, `Referer` — many WAFs and analytics pipelines log these
   into SQL), cookies, and path segments.
2. **Establish baseline** — capture the response (status, body length, timing) for the
   *unmodified* request.
3. **Probe with deterministic payloads.** Each probe has a hypothesis:

   | Payload         | Hypothesis                                              |
   |-----------------|---------------------------------------------------------|
   | `'`             | Breaks string contexts → SQL syntax error               |
   | `"`             | Breaks identifier/string in MySQL/PG depending on mode  |
   | `\\`            | Breaks escaping logic                                   |
   | `1`             | Numeric baseline                                        |
   | `1+1` / `2-1`   | Arithmetic eval should both render as `2` / `1`         |
   | `1 AND 1=1`     | Boolean true (control)                                  |
   | `1 AND 1=2`     | Boolean false (compare against control)                 |
   | `SLEEP(5)` etc. | Time-based — only after string-based fails              |

4. **Compare** the response of `1 AND 1=1` vs `1 AND 1=2`. A reproducible diff is the
   strongest signal short of error-based confirmation.

### 4.3 Confirming with `sqlmap` (within scope)

`sqlmap` is excellent **after** manual confirmation, not as a discovery tool against
unauthorized hosts.

```bash
sqlmap -r captured_request.txt          \
       --batch                          \
       --risk=2 --level=3               \
       --technique=BEUST                \
       --random-agent                   \
       --threads=2 --delay=0.5          \
       --dbms=postgresql                \
       --output-dir=./sqlmap_out
```

Key flags:

* `-r captured_request.txt` — reuses the exact authenticated request from Burp; preserves
  cookies, custom headers, CSRF tokens.
* `--risk=2 --level=3` — moderate; do not jump to risk 3 against production.
* `--technique=BEUST` — Boolean, Error, Union, Stacked, Time. Drop `S` (stacked) on shared
  databases; stacked queries can mutate state.
* `--threads=2 --delay=0.5` — slow on purpose.

### 4.4 Blind & second-order SQLi quick reference

* **Boolean blind** — confirm with two payloads that differ only in their boolean result;
  compare response bytes / hash.
* **Time-based blind** — only when no observable diff exists; payload: `1 AND
  pg_sleep(5)` (Postgres), `IF(1=1,SLEEP(5),0)` (MySQL). Run it 3× and verify median delay
  scales linearly with the constant.
* **Out-of-band (OOB)** — DNS exfil via `xp_dirtree` (MSSQL) or `LOAD_FILE` (MySQL), with
  a Burp Collaborator / interact.sh listener. Useful when responses are completely silent.
* **Second-order** — the input is stored, then later concatenated by a *different* code
  path (export job, admin dashboard, search index reindex). Detection requires *triggering*
  the second path. Test by submitting the payload, then exercising every feature that might
  read the value back. Document the chain meticulously.

### 4.5 Secure code remediation

The defensible answer is always the same: **separate code from data**.

#### 4.5.1 Python (psycopg2 / sqlite3 / Django ORM)

```python
# WRONG — string concatenation
def get_user_wrong(conn, username: str):
    cur = conn.cursor()
    cur.execute(f"SELECT id, email FROM users WHERE username = '{username}'")
    return cur.fetchone()

# RIGHT — parameterized query (placeholder is %s for psycopg2/MySQL, ? for sqlite3)
def get_user(conn, username: str):
    cur = conn.cursor()
    cur.execute(
        "SELECT id, email FROM users WHERE username = %s",
        (username,),
    )
    return cur.fetchone()

# RIGHT — ORM (Django) — the framework parameterises for you
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.filter(username=username).only("id", "email").first()
```

For dynamic identifiers (table/column names, `ORDER BY` direction) that **cannot** be
parameterised, use an **allowlist**:

```python
ALLOWED_SORT_COLUMNS = {"created_at", "username", "email"}
ALLOWED_DIRECTIONS   = {"ASC", "DESC"}

def list_users(conn, sort_col: str, direction: str):
    if sort_col not in ALLOWED_SORT_COLUMNS:
        raise ValueError("invalid sort column")
    if direction.upper() not in ALLOWED_DIRECTIONS:
        raise ValueError("invalid direction")
    # Identifiers are now constants pulled from a trusted set — safe to interpolate.
    sql = f"SELECT id, email FROM users ORDER BY {sort_col} {direction} LIMIT 100"
    cur = conn.cursor()
    cur.execute(sql)
    return cur.fetchall()
```

#### 4.5.2 Node.js (pg / mysql2 / Knex / Prisma)

```javascript
// WRONG — template literal interpolation
const rowsWrong = await pool.query(
  `SELECT id, email FROM users WHERE username = '${username}'`
);

// RIGHT — parameterised with $1 placeholders (pg)
const { rows } = await pool.query(
  'SELECT id, email FROM users WHERE username = $1',
  [username],
);

// RIGHT — Prisma; the ORM is parameter-safe by default
const user = await prisma.user.findUnique({ where: { username } });

// RIGHT — Knex with safe identifier handling
const rows2 = await knex('users')
  .select('id', 'email')
  .where({ username })
  .orderBy(allowed.includes(sort) ? sort : 'created_at', 'asc');
```

#### 4.5.3 Java (JDBC / Spring Data / Hibernate / jOOQ)

```java
// WRONG — Statement concatenation
String sqlWrong = "SELECT id, email FROM users WHERE username = '" + username + "'";
ResultSet rsWrong = stmt.executeQuery(sqlWrong);

// RIGHT — PreparedStatement
String sql = "SELECT id, email FROM users WHERE username = ?";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, username);
    try (ResultSet rs = ps.executeQuery()) {
        // ...
    }
}

// RIGHT — Spring Data JPA; the framework parameterises @Query / derived queries
public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
```

#### 4.5.4 Defense-in-depth (independent of language)

* **Least-privilege DB account** per service (read-only where possible, no `DROP`/`ALTER`).
* **Stored procedures** *only* if they themselves use parameter binding — sprocs are not
  inherently safe.
* **WAF** (Cloudflare, AWS WAF, ModSecurity OWASP CRS) as a *belt-and-suspenders* layer,
  never as the only control.
* **Logging & detection** — log query latency outliers and DB-error spikes; both are leading
  indicators of probing.

---

## 5. OWASP Top 10 — Cross-Site Scripting (XSS)

XSS lets an attacker run JavaScript in another user's browser session. Despite being an old
class of bug, it remains in the OWASP Top 10 because modern frameworks have only auto-escaped
*some* sinks; the dangerous ones (`innerHTML`, `dangerouslySetInnerHTML`,
`v-html`, `bypassSecurityTrustHtml`, `document.write`) still exist and are still abused.

### 5.1 Variants

| Variant     | Payload lives on…             | Typical sink                                        |
|-------------|-------------------------------|-----------------------------------------------------|
| Reflected   | URL / form, echoed once       | Server-side template, error message                 |
| Stored      | Database / object store       | Comments, profile fields, support tickets, filenames |
| DOM-based   | Client-side JS                | `location.hash` → `innerHTML`                       |
| Mutation    | Browser parser quirks         | Sanitisers fooled by `<svg><style>` re-parsing      |
| Self-XSS    | User pastes into own console  | Not a vuln on its own — only impactful when chained |

### 5.2 Detection

Start with **canary** payloads that are unique to your test, so when you grep server logs or
search results you can attribute matches to your testing only:

```text
"><svg/onload=confirm(`xss-jdoe-2026-05-30-${Math.random()}`)>
javascript:confirm(`xss-jdoe-${Math.random()}`)
${{ "{{7*7}}" }}        ← also catches SSTI
{{7*7}}                  ← Jinja/Twig/Angular quick check
```

Then use a fuzzer with reflection detection:

```bash
# Discover reflection points across the parameter set
gau target.com | qsreplace "JD0EXSS" \
  | httpx -mc 200 -ms 0 -fr -nf -sr -srd reflections/
```

For DOM-based XSS, dynamic taint tooling beats grep:

* Burp Suite **DOM Invader** — drives the page with seed values, traces taint to sinks.
* `dompurify` test harness — feed candidate payloads, see if they survive sanitisation in a
  realistic version of the library the target ships.

### 5.3 Remediation patterns

The remediation hierarchy is:

1. **Don't render user-controlled HTML.** If you can render text, render text.
2. **If you must render HTML**, sanitise with a library, allowlist the tags/attributes you
   need, and pin the version.
3. **Add Content Security Policy (CSP)** as a second wall.

#### 5.3.1 Server-side (Python / Jinja2)

```jinja
{# Jinja autoescapes by default in Flask & Django — leave it alone. #}
<p>Hello, {{ user.name }}!</p>

{# DANGEROUS: |safe disables escaping. Only ever use after sanitising. #}
<div>{{ user_supplied_html|safe }}</div>

{# CORRECT alternative if rich text is needed: sanitise first. #}
{% set clean = bleach.clean(user_supplied_html,
                            tags=['b','i','em','strong','a','p','br','ul','ol','li'],
                            attributes={'a': ['href','title','rel']},
                            protocols=['http','https','mailto']) %}
<div>{{ clean|safe }}</div>
```

#### 5.3.2 Client-side (React / Vue / Angular)

```jsx
// SAFE — React escapes children by default.
function Comment({ body }) {
  return <p>{body}</p>;
}

// DANGEROUS — only used with a vetted sanitiser like DOMPurify.
import DOMPurify from "dompurify";
function RichComment({ html }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "title", "rel"],
    ALLOWED_URI_REGEXP: /^(https?:|mailto:|tel:)/i,
  });
  return <p dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

#### 5.3.3 Content Security Policy

A strict CSP turns most reflected XSS into a self-DoS for the attacker. The modern
"strict-dynamic" pattern with nonces is the most maintainable:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{{request_nonce}}' 'strict-dynamic';
  object-src 'none';
  base-uri  'none';
  frame-ancestors 'none';
  require-trusted-types-for 'script';
  upgrade-insecure-requests;
  report-to csp-endpoint;
report-to: { "group":"csp-endpoint",
             "max_age":10886400,
             "endpoints":[{"url":"https://csp.example.com/report"}] }
```

Things to verify after deploying CSP:

* No `unsafe-inline` and no `unsafe-eval` in `script-src`.
* No wildcard hosts (`https:` or `*.cdn.com`) — they undo the policy in seconds.
* `frame-ancestors 'none'` blocks clickjacking; check the `X-Frame-Options` legacy header
  too if you must support old browsers.
* Run for ≥ 2 weeks in `Content-Security-Policy-Report-Only` mode first; tune from real
  reports rather than developer guesses.

#### 5.3.4 Cookie hardening (mitigates impact)

```http
Set-Cookie: sid=...; Secure; HttpOnly; SameSite=Lax; Path=/
```

`HttpOnly` blocks JavaScript from reading the session cookie, so even a successful XSS
cannot directly exfiltrate the session. It is **mitigation**, not prevention.

---

## 5A. OWASP Top 10 — Cross-Site Request Forgery (CSRF)

CSRF abuses **ambient authority**: the browser automatically attaches the victim's session
cookie to *any* request to the target origin, including requests forged by an attacker-controlled
page. If a state-changing endpoint trusts the cookie alone, an off-site `<form>` or `fetch` can
act as the victim. CSRF is an *authorization-context* bug, not a code-injection bug — the payload
is a perfectly well-formed request issued from the wrong place.

### 5A.1 Preconditions (all three must hold)

1. A state-changing action reachable with a **predictable** request shape.
2. The action authenticates **only** via automatically-sent credentials (session cookie,
   HTTP Basic, Windows-integrated auth).
3. No unpredictable, per-request **anti-forgery token** is required and validated.

Break any one precondition and the bug is gone. Modern defenses break #2 (`SameSite`) and #3
(synchronizer/double-submit tokens) simultaneously.

### 5A.2 Audit methodology (authorized scope only)

```
[ ] Inventory every state-changing endpoint (POST/PUT/PATCH/DELETE, and any GET that mutates).
[ ] For each, capture a legitimate request in a proxy, then in a SEPARATE test account:
    [ ] Remove the CSRF token (and any custom header). Does the action still succeed? -> finding.
    [ ] Replay with a token from a DIFFERENT session. Accepted? -> token not bound to session.
    [ ] Change Content-Type to text/plain / application/x-www-form-urlencoded (simple request,
        no CORS preflight). Still accepted? -> only a custom-header check was protecting it.
    [ ] Check Set-Cookie: is SameSite=Lax|Strict present on the session cookie?
    [ ] Check whether a GET request can perform the mutation (always a finding).
[ ] JSON APIs: confirm the server REQUIRES Content-Type application/json AND rejects cross-origin
    requests (a forged form can only send "simple" content types, which triggers a preflight for
    application/json — but only if the server actually enforces it).
```

A safe proof-of-concept for a report is an **HTML form on a benign page that targets your own
test account** and demonstrates the unauthorized state change — never against another user.

### 5A.3 Defense layers (defense-in-depth)

| Layer | Mechanism | Notes |
|---|---|---|
| Cookie attribute | `SameSite=Lax` (default) or `Strict` | Stops most cross-site cookie attachment; `Lax` still allows top-level GET navigations |
| Synchronizer token | Per-session random token in a hidden field, validated server-side | Strongest for classic form apps; requires server state |
| Double-submit cookie | Token in both a cookie and a request header/field; server compares | Stateless; pair with HMAC-signing so it can't be forged |
| Origin/Referer check | Validate `Origin`/`Sec-Fetch-Site` against an allowlist | Cheap secondary layer |
| Re-authentication | Step-up auth / password confirm for sensitive actions | For money movement, email/password change |

### 5A.4 Secure code remediation

**Synchronizer token (Express, server-stored, HMAC-signed double-submit):**

```js
const crypto = require('crypto');
const CSRF_SECRET = process.env.CSRF_SECRET; // >= 32 bytes, from a secrets manager

function issueToken(sessionId) {
  const nonce = crypto.randomBytes(16).toString('base64url');
  const sig = crypto.createHmac('sha256', CSRF_SECRET).update(`${sessionId}.${nonce}`).digest('base64url');
  return `${nonce}.${sig}`;
}

function verifyToken(sessionId, token) {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [nonce, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', CSRF_SECRET).update(`${sessionId}.${nonce}`).digest('base64url');
  // Constant-time comparison defeats timing oracles.
  const a = Buffer.from(sig), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Enforce on all unsafe methods.
const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
app.use((req, res, next) => {
  if (!UNSAFE.has(req.method)) return next();
  const token = req.get('X-CSRF-Token') || req.body?._csrf;
  if (!verifyToken(req.session.id, token)) return res.status(403).json({ error: 'csrf_failed' });
  next();
});
```

**Cookie hardening (the cheap, high-impact baseline):**

```
Set-Cookie: sid=<value>; Secure; HttpOnly; SameSite=Lax; Path=/
```

**Django / Rails / Laravel / Spring Security ship CSRF protection on by default** — the real-world
finding is almost always a developer who *disabled* it (e.g. `@csrf_exempt`, `protect_from_forgery`
removed, `csrf().disable()`), or a JSON API that trusts the cookie without verifying `Content-Type`
and `Origin`. **Remediation = re-enable the framework default and bind the token to the session.**

### 5A.5 Common false positives

- Endpoints that require a non-forgeable custom header *and* the server rejects simple requests —
  the browser's CORS preflight already blocks the forgery.
- Login/logout CSRF is lower severity but still report-worthy (login CSRF can fixate a session).
- `GET` endpoints that are genuinely read-only are not CSRF-able for state change.

---

## 6. OWASP Top 10 — Broken Authentication & Session Mgmt

This category is now framed as "Identification & Authentication Failures" in OWASP Top 10
2021. The bugs are usually mundane: predictable session IDs, missing rate limits, JWTs with
the algorithm set to `none`, password-reset tokens that don't expire.

### 6.1 Audit checklist

Walk through each item against the target. Each line is a potential finding.

**Account creation & login**

* [ ] Is signup open or invite-only? Does the signup page reveal whether an email is already
      registered (user-enumeration)?
* [ ] Does login give different responses or timing for "wrong user" vs "wrong password"?
* [ ] Is **password complexity** enforced server-side? (Client-only checks are no checks.)
* [ ] Is **breached-password screening** done (e.g. `haveibeenpwned/Pwned Passwords`
      k-anonymity API)?
* [ ] **Rate limiting** — try 30 wrong passwords in 30 seconds. Account lockout? IP-based
      throttling? CAPTCHA after N failures?
* [ ] **MFA** — is it offered? Can it be bypassed by skipping the second-factor step
      ("Forgot 2FA?" path, recovery codes never expiring, downgrade to SMS)?

**Session management**

* [ ] Session ID is generated by the server, ≥ 128 bits of entropy, opaque (not user data).
* [ ] Cookie has `Secure; HttpOnly; SameSite=Lax|Strict`.
* [ ] Logout actually invalidates the session **server-side** (not just deletes the cookie).
* [ ] Concurrent-session policy: known device list, ability to revoke remotely.
* [ ] Idle timeout *and* absolute timeout.
* [ ] Session ID rotates on privilege change (after login, after password change).

**Password reset**

* [ ] Reset link is single-use, expires (≤ 60 min typical), ≥ 128 bits entropy.
* [ ] Reset link does not include the user ID in a way that lets an attacker swap it.
* [ ] Reset email is sent over TLS to a verified address.
* [ ] Reset triggers session invalidation across all devices.

**Tokens (JWT, OAuth)**

* [ ] Algorithm is allowlisted server-side; `alg: none` and `alg: HS256` swapped for an
      `RS256` public key are both rejected.
* [ ] Tokens are short-lived (≤ 15 min) with a refresh token in an HttpOnly cookie.
* [ ] `jti` claim is present so individual tokens can be revoked.
* [ ] `aud` and `iss` are validated.
* [ ] No sensitive data in JWT payload (it is **not encrypted**, only signed).

### 6.2 Selected attacks (with safe verification recipes)

#### 6.2.1 Credential stuffing test (own accounts only)

```python
# Verifies your *own* test accounts cannot be brute-forced. Run against staging.
import asyncio, aiohttp, itertools, time

USERS = ["jdoe+test1@example.com", "jdoe+test2@example.com"]
PASSWORDS = ["wrong-1", "wrong-2", "wrong-3", "wrong-4", "wrong-5"]
URL = "https://app.target.com/api/login"

async def attempt(session, u, p):
    async with session.post(URL, json={"email": u, "password": p}) as r:
        return u, p, r.status, await r.text()

async def main():
    async with aiohttp.ClientSession() as s:
        for u, p in itertools.product(USERS, PASSWORDS):
            user, pw, status, body = await attempt(s, u, p)
            print(f"{user:30s} {pw:10s} -> {status}")
            await asyncio.sleep(0.3)  # be polite

asyncio.run(main())
```

What you are looking for:

* The 6th–10th attempt should be rate-limited (HTTP 429) or CAPTCHA-gated.
* Status / body / timing should be **identical** for "no such user" and "wrong password".
* After repeated failures the account should be temporarily locked (with a *user-visible*
  notification path, not a silent lockout that can be weaponised for DoS against real users).

#### 6.2.2 JWT misconfiguration

Three classic bugs to check (only against your own valid token):

```text
1) alg: none
   Modify the header to {"alg":"none","typ":"JWT"}, drop the signature, replay.
   Server MUST reject. If accepted → critical.

2) HS256 confusion
   The server uses RS256 with a public key K. If verification code uses HMAC with K as
   the secret, an attacker can forge tokens. Re-sign your token with HS256 using the
   public key as secret.

3) kid path-traversal / SQLi
   "kid":"../../../../dev/null" or "kid":"key' UNION SELECT 'AAAA"
   Some implementations look up signing keys by the kid header; if that lookup is naive
   the attacker controls the verification key.
```

Document the result with the token *before* and *after*, the header decoded, and the server
response. Do not exfiltrate other users' data even if the bug works.

#### 6.2.3 Session fixation

1. Visit the login page **unauthenticated** and capture the `Set-Cookie` value.
2. Authenticate as a test user.
3. Compare the post-login session ID to the pre-login one.
   * **Same** → session fixation; the attacker can pre-set a victim's session ID and
     hijack their authenticated session.
   * **Rotated** → safe.

### 6.3 Secure code remediation snippets

#### 6.3.1 Password storage (Python — argon2-cffi)

```python
from argon2 import PasswordHasher, exceptions

ph = PasswordHasher(time_cost=3, memory_cost=64 * 1024, parallelism=4)

def hash_password(plaintext: str) -> str:
    return ph.hash(plaintext)

def verify_password(stored_hash: str, plaintext: str) -> bool:
    try:
        ph.verify(stored_hash, plaintext)
    except exceptions.VerifyMismatchError:
        return False
    # Auto-upgrade hash params on successful login if defaults change.
    if ph.check_needs_rehash(stored_hash):
        new_hash = ph.hash(plaintext)
        # ... persist new_hash ...
    return True
```

`argon2id` is the current PHC winner. `bcrypt` (≥ cost 12) and `scrypt` are also acceptable.
**Never** use `MD5`, `SHA-1`, plain `SHA-256`, or `PBKDF2-SHA1`.

#### 6.3.2 Session cookie issuance (Node.js / Express)

```javascript
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import crypto from 'crypto';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

app.use(session({
  store: new RedisStore({ client: redis, prefix: 'sess:' }),
  name: '__Host-sid',                       // __Host- prefix forces Secure + Path=/ + no Domain
  secret: process.env.SESSION_SECRET,       // ≥ 32 random bytes from a secrets manager
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 30,                 // 30 min idle
    path: '/',
  },
  genid: () => crypto.randomBytes(32).toString('base64url'),
}));

// Rotate session ID on privilege change
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });

  // Regenerate to prevent fixation
  await new Promise((ok, err) =>
    req.session.regenerate(e => e ? err(e) : ok())
  );
  req.session.userId = user.id;
  res.json({ ok: true });
});
```

#### 6.3.3 JWT verification (Java — auth0/java-jwt)

```java
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

public final class TokenVerifier {
    private final JWTVerifier verifier;

    public TokenVerifier(RSAPublicKey pubKey, String issuer, String audience) {
        // RS256 only; never accept "none"; lock down iss & aud.
        this.verifier = JWT.require(Algorithm.RSA256(pubKey, null))
                           .withIssuer(issuer)
                           .withAudience(audience)
                           .acceptLeeway(30)               // 30 s clock skew tolerance
                           .build();
    }

    public DecodedJWT verify(String token) {
        try {
            return verifier.verify(token);                 // throws on alg, sig, exp, iss, aud
        } catch (JWTVerificationException e) {
            throw new SecurityException("invalid token", e);
        }
    }
}
```

#### 6.3.4 Rate-limiting login

```python
# Flask + redis-py: per-account & per-IP rolling window
from flask import request, jsonify
import redis, time

R = redis.Redis()

def is_rate_limited(key: str, limit: int, window_s: int) -> bool:
    now = time.time()
    pipe = R.pipeline()
    pipe.zadd(key, {f"{now}": now})
    pipe.zremrangebyscore(key, 0, now - window_s)
    pipe.zcard(key)
    pipe.expire(key, window_s)
    _, _, count, _ = pipe.execute()
    return count > limit

@app.post("/login")
def login():
    email = (request.json or {}).get("email", "")
    ip    = request.headers.get("X-Forwarded-For", request.remote_addr)
    # 5 attempts / 5 min per account, 20 / 5 min per IP
    if is_rate_limited(f"login:acct:{email}", 5, 300) \
       or is_rate_limited(f"login:ip:{ip}", 20, 300):
        return jsonify({"error": "rate_limited"}), 429
    # ... continue with constant-time auth comparison ...
```

---

## 7. Bug Bounty Automation Workflows

A repeatable pipeline turns recon into a **continuous monitor** for in-scope targets. The
goal is to catch *new* exposures as soon as they appear (a freshly deployed staging host, a
newly committed AWS key, a CDN config change). Anything that changes day-to-day is a
candidate for high-impact findings.

### 7.1 Pipeline architecture

```
                        ┌─────────────────────┐
   cron / GH Actions ──►│   1. seeds.txt       │  in-scope domains, known IP ranges
                        └──────────┬──────────┘
                                   ▼
                        ┌─────────────────────┐
                        │ 2. passive recon    │  subfinder + crt.sh + amass-passive
                        └──────────┬──────────┘
                                   ▼
                        ┌─────────────────────┐
                        │ 3. resolve & probe  │  dnsx → httpx (status, tech, screenshots)
                        └──────────┬──────────┘
                                   ▼
                        ┌─────────────────────┐
                        │ 4. diff vs. yesterday│ git-stored corpus → notify on new lines
                        └──────────┬──────────┘
                                   ▼
                        ┌─────────────────────┐
                        │ 5. nuclei scan      │  templates filtered to your scope & risk
                        └──────────┬──────────┘
                                   ▼
                        ┌─────────────────────┐
                        │ 6. secret/leak scan │  trufflehog, gitleaks across new artifacts
                        └──────────┬──────────┘
                                   ▼
                        ┌─────────────────────┐
                        │ 7. notification     │  Slack / Discord / email; manual triage     │
                        └─────────────────────┘
```

The crucial insight is in step 4: **diff** today's output against yesterday's. Most signal
comes from *changes*. Store the corpus in a private git repo and alert only on additions /
status changes.

### 7.2 Minimum-viable orchestrator (`run.sh`)

```bash
#!/usr/bin/env bash
# Runs the recon pipeline for a single program. Designed to be cron-driven daily.
set -Eeuo pipefail

PROGRAM="${1:?usage: run.sh <program>}"
ROOT="$HOME/engagements/$PROGRAM"
TODAY="$(date -u +%F)"
OUT="$ROOT/runs/$TODAY"
LATEST="$ROOT/runs/latest"

mkdir -p "$OUT"
SEEDS="$ROOT/00-scope/seeds.txt"
[[ -s "$SEEDS" ]] || { echo "no seeds"; exit 1; }

# 1. passive subs
subfinder -dL "$SEEDS" -all -silent > "$OUT/subs_passive.txt"

# 2. resolve
dnsx -l "$OUT/subs_passive.txt" -resp -silent | sort -u > "$OUT/subs_resolved.txt"

# 3. probe
httpx -l "$OUT/subs_resolved.txt" -silent -sc -title -tech-detect \
      -ip -cname -json -o "$OUT/httpx.jsonl"
jq -r '.url' "$OUT/httpx.jsonl" | sort -u > "$OUT/live.txt"

# 4. diff vs. previous run
if [[ -L "$LATEST" ]]; then
  comm -23 "$OUT/live.txt" "$LATEST/live.txt" > "$OUT/new_hosts.txt" || true
  if [[ -s "$OUT/new_hosts.txt" ]]; then
    notify "$PROGRAM" "$(wc -l < "$OUT/new_hosts.txt") new hosts" "$OUT/new_hosts.txt"
  fi
fi

# 5. nuclei (low-noise templates only)
nuclei -l "$OUT/live.txt" \
       -severity low,medium,high,critical \
       -etags intrusive,dos,fuzz \
       -rate-limit 50 -timeout 10 \
       -o "$OUT/nuclei.txt"

ln -sfn "$OUT" "$LATEST"
```

`notify()` is a thin wrapper that posts to Slack/Discord — keep it small enough to read in
one screen.

### 7.3 Scope-enforcement guard

The single most important script in your toolbox. It refuses to run if any candidate target
is out of scope. Build it once and call it from every other script.

```python
#!/usr/bin/env python3
# scope_filter.py — reads candidates from stdin, prints only in-scope items.
import re, sys, ipaddress, os, pathlib

SCOPE_FILE     = pathlib.Path(os.environ["SCOPE_FILE"])      # one entry per line
OUT_OF_SCOPE   = pathlib.Path(os.environ["OOS_FILE"])

def load(p):
    return [l.strip() for l in p.read_text().splitlines()
            if l.strip() and not l.startswith("#")]

def make_matcher(entries):
    nets, regexes = [], []
    for e in entries:
        try:
            nets.append(ipaddress.ip_network(e, strict=False))
        except ValueError:
            # treat as a domain glob: *.example.com
            pat = "^" + re.escape(e).replace(r"\*", r"[A-Za-z0-9_-]+") + "$"
            regexes.append(re.compile(pat, re.I))
    def match(host):
        try:
            ip = ipaddress.ip_address(host)
            return any(ip in n for n in nets)
        except ValueError:
            return any(r.match(host) for r in regexes)
    return match

in_scope     = make_matcher(load(SCOPE_FILE))
out_of_scope = make_matcher(load(OUT_OF_SCOPE))

for line in sys.stdin:
    host = line.strip()
    if not host: continue
    if out_of_scope(host):
        print(f"DROP-OOS  {host}", file=sys.stderr); continue
    if not in_scope(host):
        print(f"DROP-NIS  {host}", file=sys.stderr); continue
    print(host)
```

Pipe **every** candidate target through this filter:

```bash
subfinder -d target.com -silent | python3 scope_filter.py | dnsx -silent
```

If your scope file is missing, the filter blocks everything by default — fail closed.

### 7.4 Notification & deduplication

Spamming yourself with 500 "info" notifications a day means you'll miss the one critical.
Keep a hash of every alert sent, and only notify on **new** hashes:

```python
import hashlib, json, pathlib

SEEN = pathlib.Path("alerts_seen.txt")
seen = set(SEEN.read_text().splitlines()) if SEEN.exists() else set()

def alert_once(payload: dict, send_fn):
    h = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
    if h in seen: return
    send_fn(payload)
    seen.add(h)
    with SEEN.open("a") as f:
        f.write(h + "\n")
```

---

## 8. Secrets, Open Directories & Cloud Bucket Misconfigurations

These three categories produce the highest ratio of **finding-quality to risk-of-causing-harm**
because verification can almost always be done passively or with a single safe HTTP request.

### 8.1 Leaked API keys & credentials

**Where to look:**

* Public GitHub / GitLab repos belonging to the org or its employees.
* Public NPM / PyPI / Docker Hub artifacts published from the org.
* Old paste sites & code-search engines (`grep.app`, `sourcegraph.com`, `publicwww.com`).
* JavaScript bundles served by the live site (search for `apiKey`, `token`, `Authorization`,
  `Bearer`, `AKIA`, `xoxb-`, `ghp_`, `glpat-`, `sk_live_`, `AIza`, `eyJ`).

**How to verify safely:**

* Use a tool's *built-in verification* path. `trufflehog` v3 calls a single read-only
  endpoint (e.g. `aws sts get-caller-identity`) and reports whether the key works. **Do not
  call any other endpoints.**
* Capture the verification response, redact the secret in your report (show only the first
  and last 4 chars), and submit immediately.

**Example: detecting AWS keys in a JS bundle**

```bash
curl -sS https://app.target.com/static/js/main.abc123.js \
  | grep -Eo 'AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}' \
  | sort -u
```

If a candidate appears, **do not** run `aws s3 ls`. Pass the value to `trufflehog`'s
verification mode, which will only call `sts:GetCallerIdentity`:

```bash
echo 'AKIAEXAMPLE...' | trufflehog stdin --only-verified --no-update --json
```

`sts:GetCallerIdentity` is read-only, doesn't list resources, and is the canonical "is this
key live" probe.

### 8.2 Open directories & exposed files

```bash
# Quickly check every live host for "Index of /" pages
httpx -l live.txt -silent -mc 200 -ms 50 -path "/" -title \
  | grep -i 'Index of /'

# Targeted file leaks (slow & intentional)
ffuf -u https://app.target.com/FUZZ \
     -w sensitive-files.txt \
     -mc 200,206 -fs 0 \
     -rate 10 -t 5 \
     -of csv -o leaked.csv

# sensitive-files.txt — minimum viable list
.env
.env.local
.env.production
.git/config
.git/HEAD
.svn/entries
.DS_Store
.aws/credentials
config.json
backup.sql
backup.zip
db.sql.gz
phpinfo.php
server-status
.well-known/security.txt
```

**Verifying without escalating:**

* For `.git/HEAD` — fetch only `HEAD` and `config`. Confirm "200 + recognizable git ref"
  and stop. Do not run `git-dumper` on a live host unless the program explicitly allows
  source-code exfiltration.
* For `.env` — fetch only the first ~1 KB (`curl --range 0-1024`); confirm `KEY=VALUE`
  format and stop reading. Redact every value in your report.

### 8.3 Cloud storage misconfigurations

The three most common are open S3 buckets, public GCS buckets, and unauthenticated
Azure blob containers. The same workflow applies:

1. **Generate candidate names** from the org's naming patterns:

   ```bash
   # Prefixes/suffixes commonly used by enterprises
   for env in dev staging stage prod production qa uat test backup backups archive; do
     for service in assets media uploads images cdn data logs export reports; do
       for sep in "" "-" "."; do
         echo "target${sep}${env}${sep}${service}"
         echo "${service}${sep}${env}${sep}target"
       done
     done
   done | sort -u > bucket_candidates.txt
   ```

2. **Probe with HEAD** (no listing, no download):

   ```bash
   # AWS S3 — virtual-hosted style endpoint
   while read b; do
     code=$(curl -s -o /dev/null -w '%{http_code}' "https://${b}.s3.amazonaws.com/")
     [[ $code != "404" ]] && echo "$code $b"
   done < bucket_candidates.txt
   ```

   Interpret responses:

   | Status | Meaning                                                          |
   |--------|------------------------------------------------------------------|
   | 404    | Bucket doesn't exist (no finding)                                |
   | 403    | Bucket exists, listing denied → check object-level perms cautiously |
   | 200    | Listing is public — finding (severity depends on contents)        |

3. **Confirm the finding** with the AWS CLI in **anonymous** mode against a candidate that
   returned 200:

   ```bash
   # --no-sign-request → no creds attached; equivalent to anonymous browser access
   aws s3 ls "s3://target-prod-backups" --no-sign-request --summarize \
            --human-readable | head -n 30
   ```

   **Stop at 30 lines of output.** You only need a screenshot showing that listing is
   possible and a count of objects — *not* the data itself.

4. **Check writability** only if it is in scope and won't pollute production data. The
   safest probe is a HEAD on a non-existent key, which will return either `403` (not
   writable, good) or `404` (writable as anonymous, very bad). **Never** issue a `PUT`
   without explicit, written permission to do so.

#### Equivalent for GCS and Azure

```bash
# Google Cloud Storage
curl -s -o /dev/null -w '%{http_code}\n' \
     "https://storage.googleapis.com/storage/v1/b/<bucket>/o?maxResults=1"

# Azure Blob (public list)
curl -s -o /dev/null -w '%{http_code}\n' \
     "https://<account>.blob.core.windows.net/<container>?restype=container&comp=list&maxresults=1"
```

#### Defensive controls (what the target should have done)

* **AWS:** `s3:PublicAccessBlock` on all 4 dimensions at the **account** level, plus SCP in
  the org enforcing it. AWS Config rule `s3-bucket-public-read-prohibited`.
* **GCS:** Public access prevention enforced at the org level; uniform bucket-level access
  enabled (no per-object ACLs).
* **Azure:** Storage account `allowBlobPublicAccess: false`; conditional access policies on
  the storage RBAC role.
* **All clouds:** CSPM (Wiz, Prowler, ScoutSuite, Steampipe) running daily; alert on any
  newly public bucket within 60 minutes.

### 8.4 Defensive code: server-side bucket creation guardrail

Treat every infra request like an untrusted input. Example — Terraform module for S3 that
makes "public" impossible without explicitly opting out at the org level:

```hcl
resource "aws_s3_bucket" "this" {
  bucket = var.name
  tags   = var.tags
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_logging" "this" {
  bucket        = aws_s3_bucket.this.id
  target_bucket = var.log_bucket
  target_prefix = "${var.name}/"
}
```

If your platform team enforces this module via Terraform Cloud / Atlantis policies, an
engineer cannot create a public bucket by accident. That is the *real* fix — researchers
should not have to find the same finding every quarter.

---

## 9. Reporting, Triage & Remediation Loops

A finding that the vendor cannot reproduce or understand is a finding that does not get
fixed. The report is the deliverable.

### 9.1 Anatomy of a high-quality report

1. **Title** — `<Class> in <Component> allowing <Impact>`. e.g. *"Stored XSS in support-ticket
   subject allowing session theft of any agent viewing the ticket."*
2. **Severity** — CVSS v3.1 vector + your business-context justification.
3. **Summary (≤ 5 lines)** — what, where, impact, who is affected.
4. **Reproduction steps** — numbered, copy-pastable, with the exact authenticated user and
   the request/response captured (Burp `.http` files attached).
5. **Proof of concept** — minimal payload; redact anything that could weaponize the report.
6. **Impact** — describe in business terms, not just technical (`session theft → support
   agent impersonation → access to all customer tickets`).
7. **Remediation** — concrete code or config change. Reference the framework's secure
   defaults if you are asking them to switch.
8. **References** — OWASP, CWE, vendor docs.
9. **Disclosure timeline** — proposed coordinated-disclosure schedule.

### 9.2 CVSS sanity-check

Before submitting, run the vector through a CVSS calculator and match it against the
program's published severity mapping. Don't inflate (it reads as inexperienced); don't
deflate (it ends in a low payout).

### 9.3 Cleanup checklist

Re-read `04-cleanup.md`. For each artifact:

* [ ] Test account deactivated / deleted (or hand-off requested in the report).
* [ ] Stored XSS payloads removed from posts, profiles, ticket subjects.
* [ ] Files uploaded to test path removed.
* [ ] Tickets / support cases marked as test-data or closed.
* [ ] Webhook listeners (Burp Collaborator, interact.sh) torn down.

---

## 10. Appendix

### 10.1 Reference toolset (defaults)

| Phase                     | Primary tool         | Backup / alternative                 |
|---------------------------|----------------------|--------------------------------------|
| Subdomain (passive)       | subfinder            | amass passive, assetfinder, crt.sh   |
| Subdomain (active)        | puredns + gotator    | shuffledns, massdns                  |
| HTTP probe / fingerprint  | httpx                | whatweb, wappalyzer                  |
| Port scan                 | naabu (fast) + nmap  | masscan + nmap                       |
| Content discovery         | ffuf                 | feroxbuster, dirsearch               |
| Vuln signatures           | nuclei               | vendor scanners (in scope only)      |
| Web proxy                 | Burp Suite Pro       | Caido, mitmproxy                     |
| SQLi confirmation         | sqlmap               | manual                               |
| Secrets                   | trufflehog v3        | gitleaks, detect-secrets             |
| Cloud audit (defensive)   | Prowler, ScoutSuite  | Steampipe, CloudSploit               |
| OOB                       | interact.sh          | Burp Collaborator (Pro)              |

### 10.2 Wordlist starting points

* **assetnote.io wordlists** — best curated, regularly updated.
* **SecLists** (`/usr/share/wordlists/SecLists`) — comprehensive baseline.
* **fuzzdb** — payload patterns rather than path lists; great for parameter testing.

Maintain your own wordlist deltas:

```bash
# After every program, append unique paths you discovered to your personal wordlist
sort -u personal_paths.txt seclists/Discovery/Web-Content/raft-large-words.txt \
   > merged.txt
```

### 10.3 One-page cheatsheet

```text
RECON ───────────────────────────────────────────────────────────────────
subfinder -dL seeds.txt -all -silent | tee subs.txt
dnsx -l subs.txt -resp -silent | tee resolved.txt
httpx -l resolved.txt -sc -title -tech-detect -ip -cname -json -o httpx.json
naabu -list resolved_ips.txt -top-ports 1000 -rate 1000 -o ports.txt
nmap -iL targets -Pn -sV -sC -p $(...) --max-rate 300 -oA nmap_full

OWASP ───────────────────────────────────────────────────────────────────
SQLi   :  '  "  \\  1+1  1' AND 1=1--  1' AND 1=2--  1' AND pg_sleep(5)--
XSS    :  "><svg/onload=confirm(1)>   javascript:confirm(1)
AuthN  :  alg:none JWT, pre/post-login session ID diff, 30 wrong pw rate test

LEAKS ───────────────────────────────────────────────────────────────────
trufflehog github --org=O --only-verified --json
ffuf -u https://h/FUZZ -w sensitive-files.txt -mc 200,206 -fs 0 -rate 10
aws s3 ls s3://<b> --no-sign-request   (only on 200-listing buckets)

OPSEC ───────────────────────────────────────────────────────────────────
Identify in UA: BBR-handle contact:you@domain
Cap rate: 10 rps default, never exceed program limit
Log every test: script + asciinema + Burp project file
Cleanup checklist before report submission
```

### 10.4 Further reading

* OWASP Web Security Testing Guide (WSTG) v4.2.
* OWASP Application Security Verification Standard (ASVS) v4.0.3 — use as a remediation
  spec, not just an audit checklist.
* PortSwigger Web Security Academy — every lab solved is a parameter you'll never miss.
* HackerOne / Bugcrowd disclosed-reports archives — the best "what good looks like" library
  in the industry.

---

> **Final reminder:** every command and pattern in this playbook assumes you are operating
> under explicit authorization. Recon without authorization is unauthorized access in most
> jurisdictions, regardless of intent or impact. The fastest way to lose a career is to
> "test on a hunch." When in doubt, do not test — ask the program owner first, then test.
