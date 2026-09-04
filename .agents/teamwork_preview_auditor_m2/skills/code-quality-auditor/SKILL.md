---
name: code-quality-auditor
description: >-
  Clean code, robust architecture, and defensive engineering guidelines. Use when refactoring,
  reviewing code, structuring modules, eliminating technical debt, or validating types and tests.
---

# Code Quality & Architecture Auditor

Use this skill when refactoring, reviewing code, improving type safety, writing unit tests, or structuring clean architectures.

---

## 1. Type Safety & Contracts
- **Single Source of Truth**: Define shared contracts and schemas in dedicated contract files (e.g. `shared/contracts.ts`).
- **Runtime Validation**: Validate all external inputs (API payloads, query parameters, user inputs) using Zod or equivalent schemas before passing to domain services.
- **No `any`**: Avoid implicit or explicit `any`. Use generics, discriminated unions, and `unknown` with type guards.

---

## 2. Defensive Programming & Resilience
- **Graceful Fallbacks**: Always provide fallbacks for external network services (e.g. fallback geocoders, cached data on network failure).
- **Quota & Rate-Limit Guards**: Track and clamp third-party API usage (Google Maps, LLMs) to prevent surprise billings or 429 quota exhaustion.
- **Explicit Error Handling**: Handle expected domain errors with distinct user-facing messages rather than crashing the UI.

---

## 3. Testing & Verification Standard
- **Unit & Integration Coverage**: Ensure business logic, quota trackers, and endpoint handlers have dedicated unit tests.
- **Pre-flight Verification**: Always run linting (`eslint`), TypeScript compiler checks (`tsc`), and test suites (`vitest` / `jest`) before finalizing changes.
