#!/usr/bin/env node
// PreToolUse hook: enforces Rule 3 ("never weaken a failing test").
//
// - Creating a NEW test file      -> allowed (normal permission flow)
// - Editing an EXISTING test file -> asks me to approve first
// - Deleting/moving a test via Bash -> asks me to approve first
//
// It asks rather than blocks, because sometimes a test really is wrong.
// The point is that changing a test is never something the AI does quietly.

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const TEST_FILE =
  /(^|[\/\\])(__tests__|tests?)[\/\\]|[._](test|spec)\.[cm]?[jt]sx?$|(^|[\/\\])test_[^\/\\]*\.py$|_test\.(py|go)$/;

const DESTRUCTIVE_CMD = /(^|[\s;&|])(rm|git\s+rm|mv|git\s+mv|unlink)\s/;

export function isTestFile(path) {
  return typeof path === "string" && TEST_FILE.test(path);
}

/**
 * Pure decision function, so it can be unit tested.
 * Returns null to defer to the normal permission flow, or a reason string to ask.
 */
export function decide(input, fileExists = existsSync) {
  const tool = input?.tool_name;
  const args = input?.tool_input ?? {};

  if (tool === "Bash") {
    const cmd = String(args.command ?? "");
    if (!DESTRUCTIVE_CMD.test(cmd)) return null;
    const touchesTest = cmd.split(/\s+/).some(isTestFile);
    return touchesTest
      ? `This command deletes or moves a test file:\n  ${cmd}\nRule 3: tests are never removed without my approval.`
      : null;
  }

  if (tool === "Edit" || tool === "MultiEdit" || tool === "Write") {
    const filePath = args.file_path;
    if (!isTestFile(filePath)) return null;

    const abs = resolve(input.cwd ?? process.cwd(), filePath);
    if (tool === "Write" && !fileExists(abs)) return null; // brand-new test: fine

    return `Changing an existing test: ${filePath}\nRule 3: never weaken a failing test to make it pass. Approve only if the test itself is wrong.`;
  }

  return null;
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;

  let input;
  try {
    input = JSON.parse(raw);
  } catch (err) {
    // Non-blocking error (exit 1): shown to me, doesn't wedge the session.
    console.error(`protect-tests hook: could not parse input (${err.message})`);
    process.exit(1);
  }

  const reason = decide(input);
  if (reason) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "ask",
          permissionDecisionReason: reason,
        },
      })
    );
  }
  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
