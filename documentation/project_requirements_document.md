# Project Requirements Document

## 1. Project Overview

We are building a browser-based, conversational Cloud IDE that lets users write, edit, and preview code in real time without any upfront registration. At its core, the system offers a chat interface powered by a large language model (LLM) that accepts plain-English or code commands, a file explorer with an embedded code editor, and a live preview pane. Behind the scenes, each user gets a sandboxed Docker container where their code runs and auto-reloads, ensuring a safe and isolated environment for experimentation.

This project aims to remove the friction of setting up local development environments and streamline the prototyping process. By combining AI-driven code assistance with instant feedback, the platform helps developers, students, and hobbyists go from idea to working demo in seconds. Success will be measured by user adoption (number of sessions started), response latency (chat responses under 1 second), and system stability (99.9% uptime for the core API).

## 2. In-Scope vs. Out-of-Scope

### In-Scope (MVP Features)
- Chat-based command interface that delegates to an AI orchestrator endpoint (`/api/agent`).
- Sandboxed Docker containers spun up per session, pre-installed with Node.js and development tools.
- File explorer and code editor (Monaco) with basic file operations (create, read, write, delete).
- Live preview pane (iframe) that hot-reloads on code changes.
- Core tool modules for reading/writing files and running shell commands inside the container.
- Optional user sign-in (NextAuth with GitHub) to save and list projects.
- Basic project snapshot/versioning saved in PostgreSQL via Drizzle ORM.
- Real-time streaming of AI responses and shell output using WebSockets or Server-Sent Events.

### Out-of-Scope (Future Phase)
- Built-in Git branching, merging, or pull-request workflows.
- Third-party deployment integrations (Netlify, Vercel CLI) beyond simple exports.
- Collaborative, multi-user editing in the same workspace.
- Mobile-first or native mobile apps.
- Plugin architecture or marketplace for third-party extensions.
- Advanced AI features such as code refactoring suggestions or security audits.

## 3. User Flow

When a new visitor lands on the homepage, they immediately see the Cloud IDE interface without being forced to sign up. The left sidebar shows a file explorer; the main area is split between a chat panel (bottom-left) and a live preview iframe (right). The user types something like “Create a React component named `Header`,” and the chat input is sent to `/api/agent`. The backend spins up (or reuses) a Docker container, runs the appropriate file-system tool, and streams back both the AI’s text response and the file-change events. The code editor updates, and the iframe hot-reloads to show the new component in action.

If the user decides to save their work, they click “Sign In” (via GitHub). After authentication, they can commit a snapshot of their project, which gets recorded in the PostgreSQL database. On subsequent visits, they land on a dashboard listing their saved sessions. Clicking a session restores the container state from the last snapshot, loads the file tree, and resumes the live preview so they can continue right where they left off.

## 4. Core Features

- **AI Chat Interface**: Plain-English or code commands go through an LLM orchestrator.
- **Docker-based Sandbox**: Per-session containers to run user code safely.
- **File Explorer & Editor**: Create, read, update, delete files with Monaco Editor UI.
- **Live Preview Pane**: Iframe with hot-reload connected to the container’s dev server.
- **API Orchestration Endpoint (`/api/agent`)**: Manages sessions, delegates to tools.
- **Tool Modules**: Server-side TypeScript functions for `readFile`, `writeFile`, `runCommand`.
- **Authentication (Optional)**: NextAuth for GitHub login and project persistence.
- **Project Snapshots**: Versioning stored in PostgreSQL via Drizzle ORM.
- **Real-Time Streaming**: WebSockets or SSE for incremental AI and shell output.

## 5. Tech Stack & Tools

- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Monaco Editor.
- **Backend**: Next.js API Routes (Node.js), Drizzle ORM, PostgreSQL, Docker Engine & Docker Compose.
- **AI Model**: OpenAI GPT-4 (or GPT-4o) accessed via API from the orchestrator.
- **Real-Time**: WebSockets (Socket.io) or Server-Sent Events for streaming.
- **Authentication**: NextAuth.js with GitHub strategy.
- **Deployment**: Vercel for frontend/API, Docker host or cloud VM for container runners.

## 6. Non-Functional Requirements

- **Performance**: Chat initial response <1s, hot-reload in preview <500ms, streaming token latency minimal.
- **Scalability**: Support at least 100 concurrent sandbox containers per host.
- **Reliability**: 99.9% uptime for API endpoint, automatic container cleanup after inactivity (e.g., 10 min).
- **Security**: Containers run as non-root users, inputs sanitized against an allow-list, strict CSP, env vars protected.
- **Usability**: Responsive design, accessible components (WCAG AA), light/dark themes.

## 7. Constraints & Assumptions

- **Docker Availability**: Host environment must support Docker Engine API.
- **LLM Quotas**: Depends on having an OpenAI API key and sufficient rate limits.
- **Browser Support**: Modern Chrome/Firefox/Safari with WebSocket support.
- **Single-Tenant MVP**: No multi-tenant isolation across clusters in first release.
- **Stateless API**: Session state tracked in database; orchestrator must rehydrate context.

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: OpenAI quotas could choke simultaneous sessions—consider token caching or backoff.
- **Resource Exhaustion**: Spawning many containers may exhaust CPU/memory—implement a queue and session limits.
- **Preview Routing**: Mapping iframe requests to the right container can get tricky—use a reverse proxy with session IDs.
- **Security Risks**: Allow-list shell commands and sanitize all inputs rigorously to prevent container escape.
- **Latency Spikes**: Cold container startup can delay first commands—prewarm a small pool of idle containers.
- **Database Consistency**: Snapshotting large project directories may take time—use asynchronous background jobs with progress updates.

By following this PRD, the development team (or AI model) will have a clear, unambiguous blueprint for building the Same AI Cloud IDE MVP, ensuring that all major components, flows, and constraints are covered.