---
title: Ethical Hacking Foundations (Authorized Testing & Defense)
domain: 04 — Offensive/Defensive Security
status: done
depth: graduate
prerequisites: [networking basics, OS fundamentals, basic scripting]
reading_time: ~34 min
last_updated: 2026-05-29
scope_note: >
  Written for AUTHORIZED security testing, defensive auditing, and hardening only.
  Nothing here is a step-by-step attack guide; the emphasis is on understanding
  attacker methodology so defenders can detect and prevent it. Never test systems
  you do not own or lack explicit written permission to assess.
---

# Ethical Hacking Foundations (Authorized Testing & Defense)

Ethical hacking is the practice of **thinking like an adversary under legal authorization** to
find and fix weaknesses before a real attacker exploits them. The discipline is defined first by
*authorization and ethics*, second by methodology, and only third by tools. This file frames the
legal/ethical bedrock, the adversary mindset, the kill-chain model defenders must understand, and
how findings convert into hardening.

---

## 1. Technical Mechanisms

### 1.1 The non-negotiable: authorization & scope

No technique is "ethical" without **explicit, written authorization**. Before any testing:

- **Rules of Engagement (RoE):** what's in scope (IPs, domains, apps), what's *out*, allowed
  techniques, testing windows, data-handling rules, and emergency contacts.
- **Authorization document / "get-out-of-jail" letter:** signed permission from someone with the
  authority to grant it. Testing without it is a crime in most jurisdictions (e.g., the U.S.
  Computer Fraud and Abuse Act, the UK Computer Misuse Act, and equivalents worldwide).
- **Scope discipline:** never touch out-of-scope systems; stop and report if you stumble onto
  something dangerous or onto third-party data.
- **Data minimization:** prove access without exfiltrating real sensitive data; handle any
  incidental PII per the RoE and law.

> **Foundational principle:** *Authorization defines the line between security research and a
> felony.* The skills are identical; the paperwork is what makes it lawful and ethical.

### 1.2 Categories of authorized assessment

| Type | Knowledge given | Simulates |
|---|---|---|
| **Black box** | none (external) | an outside attacker with no inside info |
| **Grey box** | partial (some creds/docs) | a user/partner or post-phishing foothold |
| **White box** | full (source, architecture) | thorough audit; maximizes coverage |
| **Red team** | objective-based, stealthy | a real adversary vs. the *whole* org (people/process/tech) |
| **Purple team** | red + blue collaborating | tuning detection/response in real time |

### 1.3 The Cyber Kill Chain & MITRE ATT&CK (defender's map)

Lockheed Martin's **Cyber Kill Chain** models an intrusion as stages — *reconnaissance →
weaponization → delivery → exploitation → installation → command-and-control → actions on
objectives*. Breaking any link disrupts the attack. **MITRE ATT&CK** is the modern, granular
knowledge base of real-world adversary **tactics** (the "why": initial access, persistence,
privilege escalation, lateral movement, exfiltration) and **techniques** (the "how").

> **Why defenders study this:** ATT&CK lets a blue team map their detections to known techniques,
> find coverage gaps, and prioritize. Every offensive step a tester takes should produce a
> *detection opportunity* the defender can then build on.

### 1.4 The CIA triad & defense-in-depth

Security objectives reduce to **Confidentiality, Integrity, Availability** (plus authenticity &
non-repudiation). Defenses are layered (**defense-in-depth**) so no single failure is fatal:
perimeter → network segmentation → host hardening → application controls → data encryption →
monitoring → response. Complementary principles: **least privilege**, **zero trust** (never
trust, always verify), **fail securely**, and **secure defaults**.

---

## 2. Application Frameworks

### 2.1 The assessment lifecycle (authorized)

```
1. SCOPING & AUTH    RoE, written authorization, scope, timing, contacts
2. RECON             passive (OSINT, public records) then active (enumeration) — within scope
3. ENUMERATION       map the attack surface: services, versions, endpoints, users
4. VULN ANALYSIS     identify weaknesses (config, patching, logic) and validate (no false positives)
5. CONTROLLED EXPLOIT prove impact minimally & safely; never destabilize production
6. POST-EXPLOIT      assess what an attacker could reach (privilege, lateral, data) — document, don't pillage
7. REPORTING         findings, evidence, risk rating, REMEDIATION guidance (the real deliverable)
8. RETEST            verify fixes
```

The **report**, not the exploit, is the product. A finding without clear, prioritized
remediation guidance has little defensive value.

### 2.2 Risk rating: turning findings into priorities

Use a consistent model so remediation is prioritized by *business risk*, not novelty:
- **CVSS** (Common Vulnerability Scoring System) for a standardized 0–10 technical severity.
- Contextualize with **likelihood × impact** for *your* environment (an internal-only,
  compensating-control-protected bug ranks lower than an internet-facing one).
- Map to a remediation SLA (e.g., critical: days; high: weeks).

### 2.3 Building a legal practice lab (skill development)

Develop skills *only* in environments built for it:
- **Intentionally vulnerable apps:** OWASP Juice Shop, DVWA, WebGoat (run locally/isolated).
- **CTF & training platforms:** Hack The Box, TryHackMe, PortSwigger Web Security Academy,
  PicoCTF — sanctioned, legal targets.
- **Your own isolated VMs/network** (host-only networking) — never the open internet.
- **Bug bounty programs** for real-world *authorized* targets (see `bug-bounty-workflows.md`).

### 2.4 From offense to hardening (the defender's payoff)

Each attacker tactic maps to concrete defenses:

| Attacker goal | Defensive control |
|---|---|
| Recon/enumeration | minimize exposed surface, banner/version hygiene, rate limiting, monitoring |
| Initial access (phishing) | MFA, email auth (SPF/DKIM/DMARC), user training, EDR |
| Exploitation | patch management, secure config, input validation, WAF |
| Privilege escalation | least privilege, patching, hardening baselines (CIS Benchmarks) |
| Lateral movement | network segmentation, zero trust, credential hygiene |
| Persistence/C2 | EDR, egress filtering, anomaly detection |
| Exfiltration | DLP, egress controls, encryption, monitoring |

### 2.5 Disclosure ethics

If you find a vulnerability (even incidentally), follow **coordinated/responsible disclosure**:
report privately to the owner, give reasonable time to fix, and don't weaponize or publicize
prematurely. Many orgs publish a `security.txt` / Vulnerability Disclosure Policy (VDP) — use it.

---

## 3. Common Pitfalls

1. **Testing without written authorization.** The single unforgivable error — it's illegal.
2. **Scope creep.** Touching out-of-scope or third-party systems; pivoting beyond the RoE.
3. **Destabilizing production.** Aggressive scans/exploits causing outages or data loss.
4. **Exfiltrating real data** to "prove" a finding — prove access minimally instead.
5. **Tool-first thinking.** Running a scanner ≠ a pentest; tools find candidates, judgment
   validates and contextualizes.
6. **Unvalidated findings.** Reporting scanner output as fact (false positives) destroys
   credibility.
7. **Weak reporting.** No remediation guidance, no risk context, no reproduction steps → no
   defensive value.
8. **Ignoring detection.** Not noting whether the blue team *could* have caught each step (the
   purple-team value).
9. **Premature/public disclosure** that endangers users before a fix exists.

---

## 4. Advanced Resources

**Frameworks & standards**
- MITRE ATT&CK: <https://attack.mitre.org/>
- Lockheed Martin Cyber Kill Chain: <https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html>
- NIST SP 800-115 (Technical Guide to Information Security Testing):
  <https://csrc.nist.gov/pubs/sp/800/115/final>
- PTES (Penetration Testing Execution Standard): <http://www.pentest-standard.org/>
- CIS Benchmarks (hardening baselines): <https://www.cisecurity.org/cis-benchmarks>

**Legal**
- CFAA (US), Computer Misuse Act 1990 (UK), and your local equivalent — *know the law that
  applies to you*.

**Learning (legal, sanctioned)**
- PortSwigger Web Security Academy: <https://portswigger.net/web-security>
- OWASP Juice Shop / WebGoat; TryHackMe; Hack The Box; PicoCTF.

---

### Cross-references
- `pentesting-methodology.md` — the detailed phased process.
- `owasp-frameworks.md` — the application-vulnerability taxonomy & defenses.
- `bug-bounty-workflows.md` — real-world authorized testing.
- `network-defense.md` — blue-team detection & hardening.
- `cryptography.md` — protecting confidentiality & integrity.
