// @vitest-environment node
// Validates .claude/agents/*.md. Claude Code silently ignores unknown frontmatter
// fields, so a typo like `model: haikuu` would quietly fall back to another model.
import {describe, expect, it} from 'vitest';
import {readdirSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const DIR = fileURLToPath(new URL('../.claude/agents/', import.meta.url));
const MODELS = new Set(['haiku', 'sonnet', 'opus', 'fable', 'inherit']);
const EFFORTS = new Set(['low', 'medium', 'high', 'xhigh', 'max']);
const FIELDS = new Set([
  'name', 'description', 'tools', 'disallowedTools', 'model', 'permissionMode', 'maxTurns',
  'autoCompactWindow', 'skills', 'mcpServers', 'hooks', 'memory', 'background', 'omitClaudeMd',
  'effort', 'isolation', 'color', 'initialPrompt', 'experimental',
]);
const WRITE_TOOLS = ['Write', 'Edit', 'MultiEdit'];

// Routing table: changing a role's model is a deliberate decision, so it has to be made here too.
const EXPECTED: Record<string, string> = {explorer: 'haiku', checker: 'haiku', implementer: 'sonnet', reviewer: 'opus'};

function parseFrontmatter(text: string) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  const fields: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim();
  }
  return {fields, body: m[2].trim()};
}

const load = (name: string) => {
  const parsed = parseFrontmatter(readFileSync(`${DIR}${name}`, 'utf8'));
  if (!parsed) throw new Error(`${name}: missing --- frontmatter block`);
  return parsed;
};
const list = (v?: string) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);
const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));

describe('.claude/agents', () => {
  it('defines every routed role', () => {
    for (const name of Object.keys(EXPECTED)) expect(files).toContain(`${name}.md`);
  });

  it.each(files)('%s has valid frontmatter', (file) => {
    const {fields, body} = load(file);
    for (const key of Object.keys(fields)) expect(FIELDS.has(key), `unknown field "${key}" would be silently ignored`).toBe(true);
    expect(fields.name).toMatch(/^[a-z][a-z0-9-]*$/);
    expect((fields.description ?? '').length, 'description too short to route on').toBeGreaterThanOrEqual(30);
    expect(MODELS.has(fields.model), `model "${fields.model}" is not a valid alias`).toBe(true);
    if (fields.effort) expect(EFFORTS.has(fields.effort), `effort "${fields.effort}" is invalid`).toBe(true);
    expect(body.length, 'system prompt body missing').toBeGreaterThan(100);
  });

  it.each(Object.entries(EXPECTED))('%s runs on %s', (name, model) => {
    expect(load(`${name}.md`).fields.model).toBe(model);
  });

  it.each(['explorer', 'checker', 'reviewer'])('%s is read-only', (name) => {
    const {fields} = load(`${name}.md`);
    const allowed = list(fields.tools);
    const denied = list(fields.disallowedTools);
    expect(allowed.length, 'tools must be explicit; omitting inherits everything').toBeGreaterThan(0);
    for (const t of WRITE_TOOLS) expect(!allowed.includes(t) || denied.includes(t), `${name} can use ${t}`).toBe(true);
  });

  it('parser rejects text without frontmatter', () => {
    expect(parseFrontmatter('just text')).toBeNull();
  });
});
