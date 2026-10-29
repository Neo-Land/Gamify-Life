// @vitest-environment node
// Tests for .claude/hooks/protect-tests.mjs, the hook that enforces CLAUDE.md Rule 3
// ("never weaken a failing test to make it pass").
import {describe, expect, it} from 'vitest';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {decide, isTestFile} from '../.claude/hooks/protect-tests.mjs';

const HOOK = fileURLToPath(new URL('../.claude/hooks/protect-tests.mjs', import.meta.url));
const exists = () => true;
const missing = () => false;
const edit = (file_path: string, tool_name = 'Edit') => ({tool_name, tool_input: {file_path}, cwd: '/repo'});
const bash = (command: string) => ({tool_name: 'Bash', tool_input: {command}});
const runHook = (input: string) => spawnSync(process.execPath, [HOOK], {input, encoding: 'utf8'});

describe('isTestFile', () => {
  it.each([
    'tests/rewards.test.ts',
    'tests/components.test.tsx',
    'tests/e2e/journey.spec.ts',
    'tests/setup.ts',
    'lib/__tests__/ledger.js',
    'test_ledger.py',
    'pkg/ledger_test.go',
  ])('flags %s', (path) => expect(isTestFile(path)).toBe(true));

  it.each(['lib/rewards.ts', 'lib/progression.ts', 'app/api/progress/route.ts', 'components/skill-card.tsx', 'lib/testimonials.ts'])(
    'ignores %s',
    (path) => expect(isTestFile(path)).toBe(false),
  );
});

describe('decide', () => {
  it('asks before editing an existing test', () => {
    expect(decide(edit('tests/rewards.test.ts'), exists)).toMatch(/Rule 3/);
    expect(decide(edit('tests/rewards.test.ts', 'MultiEdit'), exists)).toMatch(/Rule 3/);
  });

  it('asks before overwriting an existing test with Write', () => {
    expect(decide(edit('tests/rewards.test.ts', 'Write'), exists)).toMatch(/Rule 3/);
  });

  it('allows creating a brand-new test file', () => {
    expect(decide(edit('tests/new-feature.test.ts', 'Write'), missing)).toBeNull();
  });

  it('does not intercept source edits', () => {
    expect(decide(edit('lib/rewards.ts'), exists)).toBeNull();
  });

  it('asks before deleting or moving a test via Bash', () => {
    expect(decide(bash('rm tests/rewards.test.ts'))).toMatch(/deletes or moves/);
    expect(decide(bash('git rm -f tests/e2e/reward.spec.ts'))).toMatch(/deletes or moves/);
    expect(decide(bash('pnpm lint && mv tests/placement.test.ts /tmp/'))).toMatch(/deletes or moves/);
  });

  it('does not intercept harmless commands', () => {
    expect(decide(bash('pnpm test'))).toBeNull();
    expect(decide(bash('rm -rf .next'))).toBeNull();
    expect(decide(bash('cat tests/rewards.test.ts'))).toBeNull();
  });
});

describe('hook process (end to end)', () => {
  it('emits an "ask" permission decision as JSON', () => {
    const run = runHook(JSON.stringify(edit('tests/rewards.test.ts')));
    expect(run.status).toBe(0);
    const out = JSON.parse(run.stdout);
    expect(out.hookSpecificOutput).toMatchObject({hookEventName: 'PreToolUse', permissionDecision: 'ask'});
  });

  it('stays silent for unrelated edits', () => {
    const run = runHook(JSON.stringify(edit('lib/rewards.ts')));
    expect(run.status).toBe(0);
    expect(run.stdout).toBe('');
  });

  it('fails loudly but non-blocking (exit 1) on malformed input', () => {
    const run = runHook('not json');
    expect(run.status).toBe(1);
    expect(run.stderr).toMatch(/could not parse/);
  });
});
