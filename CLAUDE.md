@AGENTS.md

# Engineering Rules

These apply to every task in this repo. If a request conflicts with one of them, say so before proceeding rather than silently ignoring the rule.

## 1. Design for failure

Applies to code that does I/O: `/api/*` handlers, Supabase calls, the repository adapters, browser storage.

- Every external call has an explicit timeout. No unbounded waits.
- Retry only idempotent operations, with backoff and a max attempt count.
- Anything that awards or creates (XP, quest rewards, achievements, completions) must be safe to retry. In this repo that means:
  - One-time ledger keys are **derived by the progression engine**, never supplied by the browser.
  - Cloud writes keep the advisory lock + revision compare-and-swap in the Postgres transaction. Never bypass or weaken it.
  - Conflicting commands are re-evaluated against the latest revision, not overwritten.
- Never swallow errors. Handle them, log them with context, or surface a retryable error to the UI. No empty `catch` blocks.
- Offline cloud mutations are not queued. Don't add silent queuing without asking.

Don't add this machinery to pure code (`lib/progression.ts`, content, UI rendering). Match the safety to the risk.

## 2. Don't break what's already working

Before modifying or renaming anything (a domain type, command, repository method, API field, DB column, content ID, skill/node ID):

1. Search for every usage and list what depends on it. Both adapters (`lib/repositories/local.ts` and `supabase.ts`) must keep matching `types.ts`.
2. State the impact before editing: "This is used by X, Y, Z."
3. Prefer additive changes: add the new thing, migrate callers, then remove the old one in a separate step.
4. Schema changes go in a **new numbered migration** in `supabase/migrations/`. Never edit an applied migration. RLS stays enabled on every private table.
5. Content IDs are stable. Saved progress references them, so renaming one orphans user data.
6. Stay in scope. Don't refactor, rename, or reformat unrelated code in the same change.

## 3. Prove it actually works

- For a bug fix: write a test that reproduces the bug, run it, and show it failing **before** writing the fix. Then show it passing.
- Tests must assert real behavior (XP totals, ledger entries, state changes, errors), not just that code runs without throwing.
- A test that could never fail proves nothing. If breaking the code doesn't make it fail, rewrite it.
- **Never weaken a failing test to make it pass.** That includes deleting it, adding `.skip`/`.only`, loosening assertions, changing expected values, or mocking out the thing being tested. A hook in `.claude/hooks/` pauses for approval on edits to existing tests.
- If you believe a test itself is wrong, stop and explain why. Change it only after I agree.
- Before saying a task is done, run the checks and report the actual results:

```sh
pnpm seed:validate   # after content changes
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e        # after UI or flow changes
```

"Should work" is not done.

## Model routing

Match the model to the work. Delegate to the subagents in `.claude/agents/`:

| Work | Delegate to | Model |
|---|---|---|
| Finding files, tracing usages before a change (Rule 2) | `explorer` | haiku |
| Running `pnpm` checks and reporting results (Rule 3) | `checker` | haiku |
| Routine, well-specified edits: UI copy, styling, content entries, boilerplate | `implementer` | sonnet |
| Reviewing a diff before commit or PR | `reviewer` | opus |

Keep these in the main session and never delegate them down: planning and design decisions; anything touching `lib/progression.ts`, `lib/rewards.ts`, the XP ledger, `/api/*`, the repository adapters, auth, RLS, or `supabase/migrations/`; and deciding whether a failing test is wrong. Run `reviewer` on any change to those areas before committing.

If a cheaper model's result looks wrong or incomplete, redo that step in the main session instead of retrying the same subagent.

## Security

- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never prefix it with `NEXT_PUBLIC_`, log it, or send it to the browser.
- Never commit `.env*` files other than `.env.example`.
- Don't claim cloud isolation works without running the opt-in two-account RLS test against a disposable project.
