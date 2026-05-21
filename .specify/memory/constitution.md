<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.0.1
Bump rationale: PATCH — wording-only update to the Quality Gates section to reflect
the test-infrastructure migration from Jest/jsdom + Cypress to Vitest browser mode
(Chromium via Playwright). No principle changed; no governance rule changed; the
intent of the gates ("unit tests pass with the same coverage floor", "parallax E2E
covered") is preserved.

Modified principles:
  (none)

Modified sections:
  - Quality Gates — renamed Jest → Vitest; renamed Cypress → Vitest browser E2E;
    updated the coverage-threshold sentence to reference the new runner.
  - CLAUDE.md root has been updated in the same PR to match.

Added sections:
  (none)

Removed sections:
  (none)

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — generic Constitution Check; no edits.
  ✅ .specify/templates/spec-template.md — no constitution bindings; no edits.
  ✅ .specify/templates/tasks-template.md — no constitution bindings; no edits.
  ✅ .specify/templates/checklist-template.md — no edits.
  ✅ CLAUDE.md (root) — updated in the same PR.

Follow-up TODOs:
  (none)

------------------------------------------------------------------------------
PRIOR VERSION 1.0.0 (initial ratification — kept for traceability):
Version change: TEMPLATE (uninitialised) → 1.0.0
Bump rationale: Initial ratification — first concrete constitution for react-spring,
replacing the placeholder template. Treated as MINOR-equivalent first release (1.0.0)
because there is no prior version to break compatibility with.
-->

# react-spring Constitution

## Core Principles

### I. Layered Architecture (NON-NEGOTIABLE)

The library is organised in strict bottom-up layers:
`@react-spring/rafz` → `@react-spring/shared` → `@react-spring/animated` →
`@react-spring/core` → `targets/*` → `react-spring` (umbrella).

- Lower layers MUST NOT import from higher layers.
- Targets MUST NOT import from other targets.
- The umbrella package MUST contain only re-exports — no logic.

**Rationale**: This is the load-bearing contract that lets the same animation engine
power web, native, three, konva, and zdog without bifurcating code. Any cross-layer
shortcut taken once propagates indefinitely.

### II. Target-Agnostic Core

`@react-spring/core`, `@react-spring/animated`, and `@react-spring/shared` MUST remain
free of platform APIs (DOM, React Native, three.js, etc.). Platform behaviour is
injected at the target boundary through:

- `Globals.assign({ batchedUpdates, createStringInterpolator, colors, ... })` for
  runtime configuration.
- `createHost(primitives, hostConfig)` for the three seams `applyAnimatedValues`,
  `createAnimatedStyle`, and `getComponentProps`.

New target-specific code MUST live under `targets/<name>/`. Adding an `animated.X`
shorthand for a new host element MUST be done by editing that target's
`primitives.ts`, not by touching core.

**Rationale**: The whole reason `core` is target-agnostic is so we can ship a fifth,
sixth, or seventh renderer without rewriting the engine. Leaking platform code into
core silently destroys that optionality.

### III. Test-First Animation Behaviour (NON-NEGOTIABLE)

Animation behaviour MUST be covered by deterministic unit tests using the helpers in
`packages/core/test/setup.ts`:

- Use `advance`, `advanceByTime`, `advanceUntil`, `advanceUntilIdle`, and
  `advanceUntilValue` instead of real timers, `jest.runAllTimers()`, or
  `jest.advanceTimersByTime`.
- Reset `rafz` and `frameLoop` per test (the setup file already does this; do not
  bypass it).
- New public behaviour on `SpringValue`, `Controller`, `SpringRef`, interpolation,
  or any hook MUST land with a test in the same PR.

**Rationale**: Animation bugs are almost always timing bugs. The mock-raf based
helpers are the only way to assert frame-accurate behaviour without flakiness, and
they only work if every test goes through them.

### IV. Version-Locked, Changeset-Driven Releases

All published packages share a single version line and are released together.

- Every PR that changes runtime behaviour, public API, or a published export MUST
  include a changeset (`pnpm changeset`).
- A breaking change to any package's public API requires a MAJOR changeset and MUST
  bump every target.
- Additive, backward-compatible changes use MINOR; bug fixes and internal refactors
  that preserve public APIs use PATCH.
- Prereleases go through `pnpm changeset pre enter alpha|beta|next` first.

**Rationale**: Targets share the core engine; staggered versions across packages
would silently desynchronise users' lockfiles and produce hard-to-diagnose runtime
mismatches. Changesets are the audit trail.

### V. Performance Discipline on the Hot Path

Code that runs inside `rafz` queues or `FrameLoop` (per-frame `update`, `onFrame`,
`write`) MUST:

- Avoid per-frame allocations where reasonably achievable (reuse objects, prefer
  numeric ops over string ops, avoid creating closures inside loops).
- Avoid synchronous DOM reads/writes outside the `write` queue.
- Carry benchmark or microbench evidence in the PR description when the change is
  plausibly perf-sensitive (e.g. changes to interpolation, `SpringValue.advance`,
  `FrameLoop.advance`, or any target's `applyAnimatedValues`).

`frameLoop` defaults to `'always'`; targets that change it (e.g. `targets/three`
sets `'demand'`) MUST document the integration that drives ticks.

**Rationale**: react-spring is on the render-blocking path for every animation in
every consuming app. A regression here is amplified across the entire ecosystem.

## Quality Gates

Every PR MUST pass, locally and in CI, before review approval:

- `pnpm lint` — ESLint via `eslint-config-react-spring` is clean. `no-console`
  errors are blocking except `console.warn`/`console.error`. Unused variables MUST
  be `_`-prefixed.
- `pnpm test:ts` — `tsc --noEmit` is clean across all packages.
- `pnpm test:unit` — Vitest unit tests pass (browser mode, Chromium via Playwright).
  The configured coverage thresholds (80% statements / 74% branches / 71% functions
  / 82% lines) MUST be met when running `pnpm test:cov` (`@vitest/coverage-v8`).
- `pnpm prettier:check` — Prettier reports no diff. The Husky `pre-commit` hook
  enforces this; do not bypass it.
- Commit messages and PR titles MUST follow Conventional Commits. `commitlint`
  enforces this via the Husky `commit-msg` hook.

Vitest browser E2E (`pnpm test:e2e`) covers `@react-spring/parallax` and MUST pass
locally for any change touching that package. CI runs the E2E job as part of the
standard workflow.

## Development Workflow

- Default branch and PR base: `next`. `main` may exist but is not the active line.
- Branch names follow `<type>/<short-desc>` (Conventional Commit prefix). When a
  Linear ticket exists, prefer `<type>/<LINEAR-ID>`.
- Prefer small, focused PRs. For multi-step work, use stacked PRs and rebase to
  keep the stack current.
- All PRs are squash-merged.
- Never push to remote without explicit confirmation from the maintainer.
- `vitest.config.ts`'s `resolve.alias` rewrites `@react-spring/*` to source, so
  unit and E2E tests run without `pnpm build`. Anything outside Vitest (docs,
  publish-ci) MUST be preceded by `pnpm build`.
- Releases follow: `pnpm changeset` → `pnpm vers` → `pnpm release`. Do not bump
  versions by hand.

## Governance

This constitution supersedes ad-hoc conventions and individual preferences when
they conflict. CLAUDE.md and other guidance files are subordinate to it.

**Amendment procedure**:

1. Open a PR that updates `.specify/memory/constitution.md`, bumps the version per
   the policy below, and prepends a Sync Impact Report comment summarising the
   change.
2. Update any dependent templates (`.specify/templates/*.md`) and guidance docs
   that reference principles changed by the amendment.
3. PR review by at least one maintainer is required. Squash-merge into `next`.

**Versioning policy** (semantic):

- **MAJOR** — Backward-incompatible removal or redefinition of a principle or
  governance rule.
- **MINOR** — New principle or section added, or material expansion of guidance.
- **PATCH** — Clarifications, wording, typo fixes, non-semantic refinements.

**Compliance review**:

- Plans generated via `/speckit-plan` MUST pass the Constitution Check gate
  against this file before Phase 0 and again after Phase 1.
- Deviations that cannot be removed MUST be justified in the plan's Complexity
  Tracking section, naming the simpler alternative that was rejected and why.
- Reviewers SHOULD cite the relevant principle (e.g. "Principle II: Target-Agnostic
  Core") when requesting changes for principle-driven reasons.

**Version**: 1.0.1 | **Ratified**: 2026-05-21 | **Last Amended**: 2026-05-21
