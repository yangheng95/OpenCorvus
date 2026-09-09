import { expect, test } from "bun:test"
import { createRequire } from "node:module"
import { spawnSync } from "node:child_process"

const require = createRequire(import.meta.url)
const effectRequire = createRequire(require.resolve("effect"))
const parserPath = effectRequire.resolve("toml")

test("Effect's TOML dependency returns data and its default nesting-limit error", () => {
  const result = spawnSync(
    process.execPath,
    [
      "-e",
      `
    const { parse } = require(${JSON.stringify(parserPath)});
    const data = parse('name = "OpenCorvus"\\nvalues = [1, 2]');
    let error;
    try { parse('a=' + '['.repeat(501) + '0' + ']'.repeat(501)); }
    catch (caught) { error = { message: caught.message, line: caught.line }; }
    console.log(JSON.stringify({ data, error }));
  `,
    ],
    { encoding: "utf8", timeout: 5000 },
  )
  expect(result.status).toBe(0)
  expect(JSON.parse(result.stdout)).toEqual({
    data: { name: "OpenCorvus", values: [1, 2] },
    error: { message: "Maximum nesting depth of 500 exceeded.", line: 1 },
  })
}, 10_000)
