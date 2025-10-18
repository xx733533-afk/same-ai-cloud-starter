# Security Guidelines for the `same-ai-cloud-starter` Cloud IDE

This document provides actionable security best practices, aligned with core principles, to harden the `same-ai-cloud-starter` repository as it evolves into a registration-free, conversational Cloud IDE with sandboxed environments and AI orchestration.

---

## 1. Security by Design

  • Embed security reviews into every design and code iteration (design docs, pull requests, retrospectives).  
  • Define threat models for major components (API gateway, container manager, orchestrator, live preview).  
  • Establish a security-owner role for ongoing oversight.

## 2. Authentication & Access Control

  • **Optional User Authentication**: Use the built-in NextAuth/BetterAuth system only for features that require persistence (e.g., snapshots).  
    – Enforce strong password policies (minimum length, complexity).  
    – Hash passwords with Argon2 or bcrypt + unique salts.  
  • **Session Management**:  
    – Use secure, HTTP-only, `SameSite=Strict` cookies for session tokens.  
    – Implement idle and absolute session timeouts.  
    – Protect against session fixation by rotating tokens on login.
  • **Role-Based Access Control**:  
    – Define roles (guest, registered, admin).  
    – Enforce server-side checks in API routes (e.g., `/api/agent`) for each operation.
  • **Multi-Factor Authentication (MFA)**:  
    – Offer TOTP or WebAuthn for registered users handling sensitive configurations (e.g., cloud deployments).

## 3. API & Service Security

  • **Enforce HTTPS/TLS 1.2+** on all endpoints (frontend, WebSocket, API routes).  
  • **CORS Policy**: Restrict `Access-Control-Allow-Origin` to your UI domain only.  
  • **Rate Limiting & Throttling**:  
    – Protect `/api/agent`, `/api/auth`, and any container-management endpoints.  
    – Use IP + session-based limits to prevent brute-force and DoS.
  • **Request Validation**:  
    – Use schema validation (e.g., Zod, Joi) for JSON payloads in Next.js API routes.  
    – Reject unknown fields and enforce strict types (e.g., containerId, command).
  • **Principle of Least Privilege**:  
    – API tokens and service credentials should only grant permissions required by each microservice.

## 4. Input Validation & Output Encoding

  • **Container Commands**:  
    – Maintain an allow-list of safe shell commands (e.g., `npm install`, `touch`, `cat`).  
    – Sanitize command arguments to prevent shell injection and path traversal.  
  • **File System Operations**:  
    – Validate file paths against a project root whitelist; reject relative paths (`..`).  
  • **Chat Inputs**:  
    – Escape or strip dangerous characters before logging or reflection.  
    – Enforce maximum input lengths to avoid resource exhaustion.
  • **Template Rendering**:  
    – Use context-aware escaping when rendering any user content in React components.

## 5. Container & Sandbox Security

  • **Non-Root Execution**:  
    – Run user workspace containers under an unprivileged OS user.  
    – Drop all unnecessary Linux capabilities (`CAP_SYS_ADMIN`, `CAP_NET_RAW`, etc.).
  • **Resource Isolation**:  
    – Configure cgroups limits for CPU, memory, and disk I/O per container.  
    – Use Docker Compose or a container orchestrator (e.g., Kubernetes) to enforce quotas.
  • **Network Controls**:  
    – Restrict outbound access from containers to only needed endpoints (e.g., npm registry).  
    – Block direct host networking; use bridge networks with strict firewall rules.
  • **Ephemeral Lifecycle**:  
    – Automatically destroy idle or completed session containers.  
    – Sanitize container images between sessions (rebuild from trusted base).
  • **Regular Base Image Updates**:  
    – Rebuild the workspace image weekly or on CVE patches.

## 6. Data Protection & Secrets Management

  • **Secrets Storage**:  
    – Never commit API keys, DB credentials, or JWT signing secrets.  
    – Use a dedicated secrets manager (e.g., HashiCorp Vault, AWS Secrets Manager) injected at runtime.  
  • **Encrypt In Transit & At Rest**:  
    – Enforce TLS for all internal and external communication.  
    – Enable disk encryption for database volumes storing snapshots or user data.  
  • **Mask Sensitive Logs**:  
    – Redact any PII, container IDs, or file paths from logs.  
    – Use structured logging with log levels.
  • **Database Access**:  
    – Use least-privilege credentials for PostgreSQL; no superuser rights.  
    – Enforce TLS connections to the database.

## 7. Real-Time Communication Security

  • **WebSockets / SSE**:  
    – Authenticate upgrade requests using session tokens.  
    – Limit message size and rate to prevent flooding.  
  • **CSRF Protection**:  
    – Apply anti-CSRF tokens or SameSite cookies for state-modifying HTTP requests.  
  • **Subresource Integrity (SRI)**:  
    – Use SRI for any third-party scripts or styles loaded in the preview iframe.

## 8. Web Application Security Hygiene

  • **Security Headers**:  
    – `Content-Security-Policy`: Restrict scripts, styles, frames (only self and approved domains).  
    – `Strict-Transport-Security`: Enforce HTTPS.  
    – `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.  
  • **Cookie Hardening**:  
    – Set `Secure`, `HttpOnly`, and `SameSite=Strict` on all session cookies.  
  • **Disable Debug Endpoints** in production (e.g., Next.js dev error overlays, verbose logs).

## 9. Infrastructure & Configuration Management

  • **Harden Hosts**:  
    – Disable unused services/ports; use a host-level firewall.  
    – Run Next.js and Docker Engine under dedicated system users.  
  • **TLS Configuration**:  
    – Use strong cipher suites; disable TLS <1.2.  
    – Renew certificates automatically (e.g., via Let’s Encrypt).  
  • **Immutable Infrastructure**:  
    – Treat containers and servers as cattle; rebuild from code rather than patch in place.  
  • **Backup & Recovery**:  
    – Encrypt and version backups of the PostgreSQL database.  
    – Test restore procedures quarterly.

## 10. Dependency Management

  • **Lockfiles**: Commit `package-lock.json` / `yarn.lock` to ensure reproducible builds.  
  • **Vulnerability Scanning**:  
    – Integrate SCA tools (e.g., Dependabot, Snyk) into CI pipelines.  
  • **Minimal Footprint**:  
    – Audit and remove unused NPM packages and Docker layers.  
  • **Timely Updates**:  
    – Automatically schedule dependency updates and security patch PRs.

---

## Conclusion
Adhering to these guidelines will help ensure that your Cloud IDE remains secure, resilient, and compliant. Continuously review and update controls as the architecture evolves and new threats emerge.
