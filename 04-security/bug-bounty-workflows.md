---
title: Bug Bounty Workflows (Authorized Disclosure)
domain: 04 — Offensive/Defensive Security
status: done
depth: graduate
prerequisites: [ethical-hacking-foundations.md, owasp-frameworks.md, web fundamentals]
reading_time: ~30 min
last_updated: 2026-05-29
scope_note: >
  Bug bounties are AUTHORIZED testing within a published program scope. Always read and
  obey each program's scope and rules; testing outside scope is unauthorized access.
  This file covers process, ethics, and reporting — not exploit development.
---

# Bug Bounty Workflows (Authorized Disclosure)

Bug bounty hunting is **authorized security testing against real targets**, governed by a
program's published **scope and policy**. The skill set is application security; the
*differentiator* between a successful researcher and a banned one is **discipline**: staying in
scope, finding high-impact issues efficiently, and writing reports triagers can act on fast.
This file is about the *workflow and economics*, applying the methodology from the other Domain
04 files to legal public targets.

---

## 1. Technical Mechanisms

### 1.1 The authorization model

Bug bounty platforms (HackerOne, Bugcrowd, Intigriti) and self-hosted **VDPs** (Vulnerability
Disclosure Programs) publish a **policy** that constitutes your authorization. It defines:
- **In-scope assets** (specific domains, apps, APIs) and **out-of-scope** (everything else).
- **Allowed/forbidden techniques** (e.g., no automated scanning, no DoS, no social engineering,
  no testing against real users' data).
- **Reward structure** (bounties by severity) vs. **VDP** (recognition only, no pay).
- **Safe harbor** language — legal protection *as long as you follow the rules*.

> **Iron rule:** the scope *is* the authorization. One request to an out-of-scope asset is
> unauthorized access. When in doubt, it's out.

### 1.2 Where the value is: impact, not volume

Programs pay for **demonstrated business impact**. Severity (typically CVSS-influenced) drives
reward. The high-value classes (mapping to `owasp-frameworks.md`):
- **Broken access control / IDOR / BOLA** — accessing other users' data.
- **Authentication/authorization bypass**, **account takeover**.
- **Injection** (SQLi, command injection), **SSRF** reaching internal/metadata.
- **Business-logic flaws** — unique to each app, invisible to scanners, often the most lucrative.
- **Sensitive data exposure**, **RCE** (the top tier).

### 1.3 Duplicates, signal, and reputation

- **Duplicates:** the first valid report of an issue wins; later identical reports are closed as
  dupes (no reward). Speed *and* finding non-obvious issues both matter.
- **Signal/reputation:** platforms track your valid-vs-noise ratio. Low-quality/spam reports
  (especially unvalidated scanner output) damage standing and can get you removed.

---

## 2. Application Frameworks

### 2.1 The hunting workflow

```
1. SELECT PROGRAM   read scope + policy fully; pick targets that fit your skills & have broad scope
2. RECON            map the in-scope attack surface (subdomains, endpoints, tech stack) — in scope only
3. UNDERSTAND       use the app as a real user; learn its logic, roles, and money/data flows
4. HUNT             probe high-impact classes (access control, auth, logic) where tools are weak
5. VALIDATE         confirm real impact safely; minimal proof; never touch other users' real data
6. REPORT           clear, reproducible, impact-framed (see 2.3)
7. COLLABORATE       respond to triage questions; respect disclosure timelines
```

### 2.2 Efficiency: depth over breadth

- **Broad-scope programs** (wildcard domains) offer more surface and fewer duplicates than
  popular narrow ones.
- **Specialize** in a class (e.g., access control or SSRF) to develop pattern recognition that
  beats generalists.
- **Manual logic testing** finds what mass scanning misses — and scanning is often forbidden
  anyway. Read each program's automation rules.
- **Recon is a force multiplier:** thorough (in-scope) asset discovery surfaces forgotten/
  staging systems where bugs cluster.

### 2.3 The report that gets paid fast

A triager must reproduce and assess risk in minutes. Include:
1. **Title:** vuln class + asset + impact in one line.
2. **Summary:** what it is and *why it matters* (business impact).
3. **Steps to reproduce:** exact, ordered, minimal.
4. **Proof:** screenshots/request-response showing impact — *without* exfiltrating real PII.
5. **Impact:** what an attacker achieves; severity rationale.
6. **Remediation:** the fix (shows you understand the root cause — and aids the defender).

> **Quality compounds:** great reports get triaged faster, rated higher, and build the
> reputation that unlocks private, less-crowded programs.

### 2.4 Ethics & disclosure discipline

- **Stay in scope, always.** No pivoting to out-of-scope assets even if reachable.
- **Don't access/modify/exfiltrate other users' data** — prove the *capability*, then stop.
- **No public disclosure** before the program authorizes it (follow the disclosure policy and
  timelines). Coordinated disclosure protects users.
- **No extortion / "beg bounties."** Threatening disclosure for payment is unethical and often
  illegal.

### 2.5 The defender's view (why programs exist)

For organizations, a bounty/VDP is **crowdsourced, pay-for-results security testing** plus a
*safe, legal channel* for good-faith researchers (publish a `security.txt`). It complements —
does not replace — internal AppSec, pentests, and a secure SDLC (`owasp-frameworks.md`). The
program's real KPI is *time-to-remediation*, not report count.

---

## 3. Common Pitfalls

1. **Testing out of scope.** Voids safe harbor → unauthorized access. The cardinal sin.
2. **Submitting unvalidated scanner output.** Low signal → reputation damage, closed reports.
3. **Accessing real user data** to "prove" impact — prove capability minimally instead.
4. **Aggressive automation / DoS** where forbidden — can cause outages and bans.
5. **Weak reports.** No reproduction steps or impact framing → slow triage, low/no reward.
6. **Chasing low-severity/info findings** in saturated programs → duplicates, little payout.
7. **Premature public disclosure** before authorization → harms users, breaks policy.
8. **Ignoring program rules** (allowed techniques, test accounts, rate limits).
9. **Begging/extortion** ("pay me or I disclose") — unethical, often criminal.

---

## 4. Advanced Resources

**Platforms & policies**
- HackerOne: <https://www.hackerone.com/> · Bugcrowd: <https://www.bugcrowd.com/> ·
  Intigriti: <https://www.intigriti.com/>
- `security.txt` standard (RFC 9116) for VDPs: <https://securitytxt.org/>

**Learning (legal, sanctioned)**
- PortSwigger Web Security Academy (free, comprehensive): <https://portswigger.net/web-security>
- OWASP WSTG & Cheat Sheets: <https://owasp.org/www-project-web-security-testing-guide/>
- Public disclosed reports (HackerOne Hacktivity) — learn from real, sanitized examples.

**Reference**
- Bugcrowd VRT (Vulnerability Rating Taxonomy) & CVSS for severity:
  <https://www.first.org/cvss/>

---

### Cross-references
- `ethical-hacking-foundations.md` — authorization, ethics, disclosure.
- `pentesting-methodology.md` — the underlying testing process.
- `owasp-frameworks.md` — the vulnerability classes you hunt and how to fix them.
- `cryptography.md` — crypto-failure findings.
