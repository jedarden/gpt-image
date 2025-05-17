# Test Specifications for LS2 – GPT-Image-1 UI

**Scope:**  
This document defines comprehensive TDD test specifications for LS2 of the aiGI workflow for the "GPT-Image-1 UI" project. It expands and refines LS1 tests to cover all new LS2 prompts and improvement targets, including core feature completion, expanded test coverage (≥80%), edge cases, error conditions, backend error handling, input validation, 404 handling, Docker/TypeScript production build, static frontend serving, and secure API key management. Each section includes acceptance criteria, edge cases, and test scaffolding for frontend and backend.

---

## Table of Contents

1. [Core Feature Completion (LS2_01)](#core-feature-completion-ls2_01)
2. [Expanded Test Coverage & Edge Cases (LS2_02)](#expanded-test-coverage--edge-cases-ls2_02)
3. [Backend Error Handling, Input Validation, and 404s (LS2_03)](#backend-error-handling-input-validation-and-404s-ls2_03)
4. [Docker/TypeScript Production Build & Static Serving (LS2_04)](#dockertypescript-production-build--static-serving-ls2_04)
5. [Secure API Key Management & Leakage Tests (LS2_05)](#secure-api-key-management--leakage-tests-ls2_05)
6. [General Test Coverage, Regression, and Metrics](#general-test-coverage-regression-and-metrics)

---

## Core Feature Completion (LS2_01)

**Acceptance Criteria:**
- Session management: Sidebar lists, creates, and loads sessions; chat history and images are session-scoped.
- Chat: Prompts and generated images are displayed in order; supports multi-turn conversations.
- Prompt input: Accepts text and image uploads; disables submit on empty/invalid input.
- Image modal: Opens on image click, shows high-res image, supports navigation (keyboard, mouse, swipe), allows mask editing/submission.
- Backend pipeline: Processes input through gpt-4.1-nano then gpt-image-1; returns generated image and metadata.
- All features are covered by tests.

**Edge Cases:**
- No sessions exist; empty chat history; duplicate session names.
- Large number of sessions (performance, scrolling).
- Invalid/large image uploads; unsupported file types.
- Modal navigation at first/last image; mask submission with/without edits.
- Backend model unavailable, slow, or returns invalid output.

**Test Scaffolding:**
```jsx
// Session Management
test('creates, lists, and loads sessions in sidebar', () => { /* ... */ });
test('handles empty session list and duplicate names', () => { /* ... */ });
test('performance with large session list', () => { /* ... */ });

// Chat & Prompt Input
test('displays chat history and generated images in order', () => { /* ... */ });
test('accepts text and valid image uploads in prompt input', () => { /* ... */ });
test('disables submit on empty/invalid input', () => { /* ... */ });

// Image Modal & Masking
test('opens modal on image click, shows high-res image', () => { /* ... */ });
test('modal navigation: keyboard, mouse, swipe', () => { /* ... */ });
test('allows mask editing and submission', () => { /* ... */ });
test('handles modal edge cases (first/last image, no images)', () => { /* ... */ });

// Backend Pipeline
test('pipeline processes input through gpt-4.1-nano and gpt-image-1', async () => { /* ... */ });
test('handles backend model errors and invalid outputs', async () => { /* ... */ });
```

---

## Expanded Test Coverage & Edge Cases (LS2_02)

**Acceptance Criteria:**
- ≥80% line and branch coverage for all new and existing features.
- Tests for all interactivity, state transitions, API integration, and error handling.
- Edge cases and negative scenarios are explicitly tested.

**Edge Cases:**
- Rapid session switching; simultaneous prompt submissions.
- Corrupted or missing local storage data.
- API/network failures, timeouts, and malformed responses.
- UI accessibility: ARIA roles, keyboard navigation, focus management.

**Test Scaffolding:**
```jsx
// Interactivity & State
test('rapid session switching preserves correct state', () => { /* ... */ });
test('simultaneous prompt submissions are handled safely', () => { /* ... */ });

// Local Storage
test('recovers from corrupted or missing local storage', () => { /* ... */ });

// API Integration & Error Handling
test('handles API/network failures gracefully', async () => { /* ... */ });
test('displays error messages for backend errors', () => { /* ... */ });
test('handles malformed backend responses', () => { /* ... */ });

// Accessibility
test('UI components have correct ARIA roles and keyboard navigation', () => { /* ... */ });
test('focus management in modal and chat input', () => { /* ... */ });
```

---

## Backend Error Handling, Input Validation, and 404s (LS2_03)

**Acceptance Criteria:**
- Centralized error handling middleware is present.
- All API inputs are validated and sanitized (e.g., using express-validator).
- 404 handler returns consistent error for unknown routes.
- All error and invalid input scenarios are tested.

**Edge Cases:**
- Missing/invalid fields in API requests.
- Malformed JSON or file uploads.
- Unhandled exceptions in pipeline or other routes.
- Requests to undefined endpoints.

**Test Scaffolding:**
```js
// Error Handling Middleware
test('returns consistent error response for unhandled exceptions', async () => { /* ... */ });
test('logs errors without leaking sensitive data', () => { /* ... */ });

// Input Validation
test('rejects requests with missing/invalid fields', async () => { /* ... */ });
test('sanitizes and validates all API inputs', async () => { /* ... */ });
test('handles malformed JSON and file uploads', async () => { /* ... */ });

// 404 Handling
test('returns 404 for unknown routes', async () => { /* ... */ });
```

---

## Docker/TypeScript Production Build & Static Serving (LS2_04)

**Acceptance Criteria:**
- Dockerfile builds backend TypeScript and runs compiled JS.
- Only one port is exposed; backend serves static frontend in production.
- Static frontend is accessible in production container.
- Tests verify production build and static serving.

**Edge Cases:**
- Build failures (TypeScript errors, missing files).
- Static files not found or misrouted in container.
- Port conflicts or misconfiguration.
- Environment variable overrides in container.

**Test Scaffolding:**
```bash
# Docker Build & Run
docker build -t gpt-image-ui-ls2 .
docker run -d -p 8080:80 gpt-image-ui-ls2

# Integration Tests (pseudo-code)
test('Docker container serves static frontend and backend API', () => { /* ... */ });
test('only one port is exposed and accessible', () => { /* ... */ });
test('production build runs compiled JS, not TS', () => { /* ... */ });
test('static files are accessible at expected routes', () => { /* ... */ });
test('environment variables are respected in container', () => { /* ... */ });
```

---

## Secure API Key Management & Leakage Tests (LS2_05)

**Acceptance Criteria:**
- API keys are stored in environment variables and never exposed to client or logs.
- Backend accesses keys securely; keys are not sent in any response.
- Tests explicitly verify no key leakage in responses or logs.

**Edge Cases:**
- Missing or invalid API key in environment.
- Attempted access to API key from client-side code.
- Backend error handling for absent/invalid keys.
- Logging under error conditions.

**Test Scaffolding:**
```js
// API Key Security
test('API key is never included in any client response', async () => { /* ... */ });
test('API key is not present in logs under any condition', () => { /* ... */ });
test('backend requires API key from environment and errors if missing', async () => { /* ... */ });
test('client cannot access API key via any endpoint or variable', async () => { /* ... */ });
```

---

## General Test Coverage, Regression, and Metrics

- All features must have ≥80% test coverage (lines, branches, functions).
- Regression tests for all critical flows (session, chat, modal, pipeline, error handling, Docker build).
- Tests must be isolated, repeatable, and documented.
- Coverage reports generated after each test run.
- Test reliability, performance, and security tracked over time.
- All test failures must be triaged and resolved before release.

---

**End of LS2 Test Specifications**