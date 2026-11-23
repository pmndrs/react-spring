---
name: 'review-pr'
description: 'Review a react-spring pull request the way the maintainers do: reproduce its claims on `next`, find the root cause, and check the fix sits where the cause is. Use when asked to review, re-review or triage a PR in this repo.'
---

# Reviewing a react-spring PR

## Before forming a view

1. Read the PR, its linked issue and any earlier review rounds. Check out the head in its own worktree (`git fetch origin pull/<n>/head:review/<n>`) and install there.
2. Reproduce the bug on `next` through the API the issue uses. Then check every claim in the description against the code. On #2631, "a `Controller` already settles" was only true without a `from`.
3. Find the root cause yourself, following "Fixing a bug" in `CLAUDE.md`. Write down every path and every trigger that reaches it.
4. Read the history of the lines the PR changes (`git log -L`) and older issues on the same behaviour. Precedent can make a reported bug by design (#848) or settle the release level (#2582).

## Judging the change

- **Location**: is the fix where the cause is, so every path benefits? A check for one trigger in one path patches over the problem.
- **Size**: write the smallest fix for the cause and compare. If the PR is much larger, find what the extra code buys and whether any of it changes behaviour nobody asked for.
- **Tests**: run the new tests against `next`'s source, and against earlier versions of the PR on a re-review. Each should fail on an assertion, not a crash. Remove each line of the fix in turn to see which are guarded. Flag tests that assert private state, assert nothing, or sit outside the module's existing test file.
- **Checks**: fork PRs run no CI until a maintainer approves the workflow runs. Run `pnpm format:check`, `pnpm lint` and the package's unit tests locally, and approve the runs before approving the PR.
- **Release level**: `patch` for behaviour that never worked, `major` only when working behaviour changes for a common pattern.
- **Overlap**: check other open PRs that touch the same code (`git merge-tree --write-tree <a> <b>`).

Do source swaps and mutation runs in a scratch worktree, never one someone has open.

## Writing the feedback

- Name the root cause and where the fix belongs, so the author doesn't copy the same patch into the other path.
- Describe the problem, not the code to write. Keep comments short and mostly questions, and mark what's blocking.
- When closing a PR in favour of a maintainer fix, link the replacement and add a short "for next time" list of what would have got it merged.
