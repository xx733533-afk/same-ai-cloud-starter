# Frontend Guideline Document

This document outlines the frontend setup for the **same-ai-cloud-starter** project. It explains the architecture, design principles, styling, components, state management, routing, performance optimizations, testing, and more. The goal is to give you a clear, non-technical overview that anyone can follow.

---

## 1. Frontend Architecture

### 1.1 Overview
- **Framework**: Next.js (App Router) handles both pages and API routes in one project.
- **Library**: React (version 19) builds dynamic, component-based UIs.
- **Language**: TypeScript for type safety across UI and API code.
- **UI Toolkit**: `shadcn/ui` paired with Tailwind CSS for prebuilt, accessible components and utility classes.
- **Styling**: Tailwind’s utility-first approach offers a fast, consistent way to style components.

### 1.2 Scalability & Maintainability
- Co-located UI and API code in Next.js keeps related files together (for example, `app/` contains pages and backend routes).
- Component-based structure (see Section 4) means UI pieces are reusable, testable, and easy to update.
- TypeScript catches errors early and makes refactoring safer.
- Tailwind’s configuration file lets you extend colors, spacing, and breakpoints in one place.

### 1.3 Performance
- Next.js automatically splits code by route.
- Tailwind’s PurgeCSS removes unused styles in production.
- Image optimization and built-in support for lazy loading (via `next/image`).

---

## 2. Design Principles

### 2.1 Usability
- Simple and intuitive interface: chat panel, file explorer, and live preview are always visible.
- Clear visual hierarchy: buttons and inputs follow a logical order of importance.

### 2.2 Accessibility
- All interactive elements are keyboard-navigable.
- ARIA attributes and proper HTML semantics ensure screen-reader support.
- Color contrasts meet WCAG AA standards for text and backgrounds.

### 2.3 Responsiveness
- Mobile-first design: layouts adapt from narrow screens (stacked panels) to wide screens (side-by-side).
- Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`, etc.) handle breakpoints predictably.

---

## 3. Styling and Theming

### 3.1 CSS Methodology
- **Utility-first**: Tailwind CSS provides atomic classes (e.g., `p-4`, `text-gray-700`).
- No BEM or other naming schemes needed; class names are built into the HTML layer.

### 3.2 Theme Management
- **Tailwind config** (`tailwind.config.js`) defines colors, fonts, and breakpoints.
- Dark mode support via the `class` strategy: toggling a global `dark` class switches to dark theme.

### 3.3 Visual Style
- **Overall Look**: Modern flat design with subtle glassmorphism accents on panels (semi-transparent backgrounds, light blur).
- **Color Palette**:
    • Primary: #3B82F6 (blue)
    • Secondary: #14B8A6 (teal)
    • Accent: #F59E0B (amber)
    • Background (light): #F3F4F6
    • Background (dark): #1F2937
    • Text (light mode): #111827
    • Text (dark mode): #F9FAFB

### 3.4 Typography
- **Font Family**: Inter (sans-serif) – clean, legible, and highly readable at small sizes.
- Headings use `font-semibold` with appropriate `text-xl`, `text-2xl`, etc.
- Body text uses `font-normal` with `text-base` or `text-sm` as needed.

---

## 4. Component Structure

### 4.1 Organization
- **`components/ui/`**: Reusable UI bits from `shadcn/ui` (buttons, modals, inputs).
- **`components/layout/`**: Layout wrappers (header, footer, sidebar, dashboard grid).
- **`components/features/`**: Feature-specific pieces (ChatPanel, FileExplorer, LivePreview).

### 4.2 Naming & Reuse
- Each component has its own folder:
  • `ComponentName/` contains `index.tsx` (render logic), `styles.module.css` or related style file, and a `README.md` if needed.
- Props are clearly typed in a `types.ts` file when complex.
- Shared logic (hooks, helpers) lives in `hooks/` or `lib/`.

### 4.3 Benefits
- Isolation: changes in one component don’t ripple unexpectedly.
- Discoverability: folder names match component names.
- Testability: each component can have its own unit tests.

---

## 5. State Management

### 5.1 Approach
- **Zustand** is used for global, shared state (e.g., user session, container ID, chat history).
- Component-local state uses React’s `useState` and `useReducer` when simple.

### 5.2 Data Flow
- Components subscribe only to the slices of state they need.
- Actions (e.g., `sendMessage`, `updateFileList`) are defined in the store for clarity.
- Middleware (e.g., logging, persistence) can be added in the store configuration.

### 5.3 Benefits
- Minimal boilerplate compared to Redux.
- TypeScript support out of the box.
- Easy to add persistence or undo/redo features later.

---

## 6. Routing and Navigation

### 6.1 Next.js App Router
- **Folder-based routing**: pages and subfolders under `app/` automatically become routes.
- Dynamic routes (e.g., `[projectId]`) handle per-project views.

### 6.2 Navigation Structure
- **Protected routes** under `app/(protected)/` require a session check (optional login).
- Public routes (e.g., landing, docs) remain at top level.
- Navigation components (NavBar, SideMenu) use Next.js’s `<Link>` for client-side transitions.

### 6.3 Route Guards
- A simple layout wrapper checks auth state from Zustand and redirects unauthorized users.

---

## 7. Performance Optimization

### 7.1 Code Splitting & Lazy Loading
- Next.js splits code by route automatically.
- Heavy components (e.g., Monaco Editor) are dynamically imported with `next/dynamic`.

### 7.2 Asset Optimization
- Images served via `next/image` with automatic resizing and WebP support.
- SVG icons are inlined or served as React components.

### 7.3 Caching & Bundling
- HTTP caching headers are set by Vercel for static assets.
- Tailwind CSS bundles are purged of unused classes in production builds.

### 7.4 Runtime Performance
- React Profiler used during development to spot slow renders.
- Memoization (`React.memo`, `useMemo`) applied sparingly to heavy components.

---

## 8. Testing and Quality Assurance

### 8.1 Unit & Integration Tests
- **Framework**: Jest with `ts-jest` for TypeScript support.
- **Utilities**: React Testing Library for component tests.
- **Coverage**: Aim for > 80% coverage on critical components (ChatPanel, FileExplorer).

### 8.2 End-to-End (E2E) Tests
- **Tool**: Cypress for user flows (typing a chat command, seeing live preview update).
- Tests run on CI with a headless browser and local mock backend.

### 8.3 Linting & Formatting
- **ESLint** with Next.js and TypeScript plugins enforces code style and catches bugs.
- **Prettier** formats code on save via a git pre-commit hook (Husky).

### 8.4 Continuous Integration
- **GitHub Actions** run tests, linting, and build checks on every pull request.
- Deployment to a staging environment occurs automatically when tests pass.

---

## 9. Conclusion and Summary

This guide covers everything you need to know about the frontend of **same-ai-cloud-starter**:

- A **Next.js** + **React** + **TypeScript** stack that unifies UI and API code.
- **Tailwind CSS** and **shadcn/ui** for a modern, accessible design with built-in dark mode.
- A **component-based** structure for easy reuse and testing.
- **Zustand** for simple, type-safe global state management.
- **Next.js routing** for fast navigation and route protection.
- Built-in **performance** optimizations like code splitting, image handling, and caching.
- **Jest**, **React Testing Library**, and **Cypress** ensure quality and reliability.

With this foundation, any developer—experienced or new—can understand, maintain, and extend the frontend confidently, focusing on delivering features that matter to users.