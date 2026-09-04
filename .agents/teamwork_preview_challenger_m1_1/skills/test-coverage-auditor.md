---
name: test-coverage-auditor
description: Measures, audits, and expands test coverage for critical business logic, edge cases, error boundaries, and state mutations across frontend and backend suites.
---

# Test Coverage Auditor Skill

## Core Principles
1. **Critical Path Testing:** 100% coverage on core business computations (filtering, ranking, distance calculation, geocoding fallback, daily quotas).
2. **Edge Case Resilience:** Null checks, out-of-bounds inputs, empty arrays, unicode normalizations, network timeouts.
3. **Deterministic Stubs:** Pure hermetic tests without unmocked network or file side-effects.
