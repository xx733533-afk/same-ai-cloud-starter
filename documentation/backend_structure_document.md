# Backend Structure Document

This document outlines the backend architecture, hosting, infrastructure, and related components of the `same-ai-cloud-starter` project—an AI-powered, registration-free Cloud IDE with conversational coding support. It is written in everyday language to ensure clarity for readers of all technical backgrounds.

## 1. Backend Architecture

- **Framework & Design Patterns**
  - Built on **Next.js** (App Router) for a unified frontend and backend codebase.  
  - Serverless-style **API routes** handle incoming requests without a separate web server.  
  - **Monorepo-like structure**: keeps UI, API routes, and AI logic in one repository for easy sharing of types and utilities.
  - **Orchestrator pattern**: a central `agent/orchestrator` module interprets user commands and delegates work to specialized “tools.”

- **Scalability**
  - Stateless API routes mean you can deploy multiple instances behind a load balancer and scale horizontally.  
  - Each user gets their own Docker-based sandbox, isolating workloads and balancing container resources independently.  
  - Database connections managed through a pool (via Drizzle ORM) to support many concurrent requests.

- **Maintainability & Performance**
  - Modular `agent/tools` directory separates concerns—each tool (file operations, shell commands, web search) lives in its own file.  
  - TypeScript everywhere ensures consistent types between frontend, API, and AI logic.  
  - Docker Compose for local development mirrors production container setups, reducing “works on my machine” issues.  
  - Environment variables drive configuration (API keys, database URL), keeping secrets out of source code.

## 2. Database Management

- **Technology Stack**
  - PostgreSQL (SQL relational database) for storing user data, project snapshots, and session info.  
  - Drizzle ORM for type-safe database queries in TypeScript.

- **Data Handling**
  - **Connection pooling**: maintains a small pool of active connections to handle bursts of traffic.  
  - **Migrations**: version-controlled SQL migrations keep the schema in sync across environments.  
  - **Backups & Retention**: daily automated backups stored offsite; retention policy of 30 days.  
  - **Data Access Patterns**:  
    - Read-heavy for loading snapshots and project lists.  
    - Write operations when users trigger snapshots, create sessions, or update metadata.

## 3. Database Schema

_Human-readable tables overview and SQL schema for PostgreSQL_

### Tables Overview
- **users**: registered users (optional).  
- **sessions**: tracks user sessions and assigned container IDs.  
- **containers**: lifecycle info for each sandbox container.  
- **project_snapshots**: metadata about saved project states.  

### SQL Schema (PostgreSQL)
```sql
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  name           TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  container_id   TEXT NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at     TIMESTAMP WITH TIME ZONE
);

CREATE TABLE containers (
  id             TEXT PRIMARY KEY,
  session_id     UUID REFERENCES sessions(id) ON DELETE CASCADE,
  status         TEXT NOT NULL,    -- e.g., 'starting', 'running', 'stopped'
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE project_snapshots (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  data_path      TEXT NOT NULL,    -- location in object storage or filesystem
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);
``` 

## 4. API Design and Endpoints

- **Approach**: RESTful Next.js API routes that return JSON. Real-time streaming via WebSockets or Server-Sent Events for long-running operations.

- **Key Endpoints**
  - `POST /api/auth/[...auth]`  
    - Handles optional user sign-in/sign-up with providers (GitHub, email).  
  - `POST /api/agent`  
    - Receives user chat commands, identifies session, and forwards to the AI orchestrator.  
  - `GET /api/agent/stream`  
    - Upgrades to WebSocket/SSE to stream AI responses and container output in real time.  
  - `POST /api/snapshots`  
    - Triggers a project snapshot; returns snapshot ID and metadata.  
  - `GET /api/snapshots`  
    - Lists a user’s saved snapshots.  
  - `DELETE /api/sessions/:id`  
    - Terminates a user session and tears down the associated container.

- **Communication Flow**
  1. UI calls `/api/agent` with a command.  
  2. API route page extracts user/session info, invokes orchestrator.  
  3. Orchestrator loads the right tool, calls container management service.  
  4. Container runs the command (e.g., `docker exec`).  
  5. Orchestrator streams back progress and final message via `/api/agent/stream`.

## 5. Hosting Solutions

- **Frontend & API**
  - **Vercel**: auto-scales Next.js app globally, built-in CDN, free SSL certificates, easy environment management.  

- **Sandbox Containers**
  - **Docker Engine** on a managed VM cluster (e.g., AWS EC2 Auto Scaling Group or DigitalOcean droplets).
  - Alternatively, **AWS ECS Fargate** for serverless container hosting (no VM management).  

- **Database**
  - **Managed PostgreSQL** service (e.g., AWS RDS, DigitalOcean Managed DB) for automated backups and failover.

- **Benefits**
  - **Reliability**: Vercel and managed DB services handle uptime and patching.  
  - **Scalability**: containers spawn on demand; Next.js scales with traffic.  
  - **Cost-effectiveness**: pay-as-you-go pricing for compute and database.

## 6. Infrastructure Components

- **Load Balancer**
  - Automatically routes API and frontend requests to healthy Next.js instances on Vercel.

- **Container Orchestration Service**
  - Manages lifecycle of sandbox containers: create, monitor health, auto-remove idle containers.

- **Caching**
  - **Redis** for session lookups and short-lived data (e.g., container routing tokens).  

- **Content Delivery Network (CDN)**
  - Vercel’s built-in CDN caches static assets (JS/CSS/images) at edge locations worldwide.

- **Reverse Proxy**
  - Routes preview traffic from the client’s iframe to the correct container port based on session ID.

## 7. Security Measures

- **Authentication & Authorization**
  - Next.js auth routes with JWT session tokens or NextAuth.  
  - Role-based checks: only allow snapshot deletion or container termination by session owner.  

- **Data Encryption**
  - TLS for all in-transit data.  
  - Managed database with at-rest encryption.

- **Container Isolation**
  - Containers run as non-root users.  
  - Curated allow-list of shell commands; all inputs sanitized.  
  - No direct host filesystem mounts; code lives inside the container’s private FS.

- **Secrets Management**
  - Environment variables stored securely in Vercel and VM secrets manager.  
  - No secrets in source code or container images.

## 8. Monitoring and Maintenance

- **Monitoring Tools**
  - **Sentry** or **Datadog** for error tracking in Next.js.  
  - **Prometheus & Grafana** for container metrics: CPU, memory, network.  
  - **Log aggregation** with **ELK Stack** (Elasticsearch, Logstash, Kibana) or a hosted solution.

- **Alerts & Health Checks**
  - Health probes on containers; automatically restart if unresponsive.  
  - Alerts for high error rates, slow database queries, or container crashes.

- **Maintenance**
  - Automated database migrations on deploy.  
  - Scheduled container image updates and vulnerability scans.  
  - Regular backup validation and DR drills.

## 9. Conclusion and Overall Backend Summary

The `same-ai-cloud-starter` backend is a cohesive, extensible foundation for a real-time, AI-powered Cloud IDE. By combining Next.js API routes, container-based sandboxes, and a PostgreSQL + Drizzle data layer, it achieves:

- **Scalability**: stateless services and on-demand containers scale to many users.  
- **Maintainability**: modular code organization and TypeScript type safety reduce complexity.  
- **Performance**: edge caching, load balancing, and container isolation ensure responsiveness.  
- **Security**: robust authentication, data encryption, and container sandboxing protect user data.

This architecture aligns with the project’s goals—offering a seamless, registration-free coding experience powered by AI—while being flexible enough to support future features like branching workflows, plugin integrations, and team collaboration.