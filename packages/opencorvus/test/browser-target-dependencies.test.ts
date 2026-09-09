import { expect, test } from "bun:test"
import { createRequire } from "node:module"
import { spawnSync } from "node:child_process"

const require = createRequire(import.meta.url)
const babelRequire = createRequire(require.resolve("@babel/core"))
const targetsPath = babelRequire.resolve("@babel/helper-compilation-targets")

test("browser target dependencies resolve targets and report conflicting Baseline options", () => {
  const result = spawnSync(
    process.execPath,
    [
      "-e",
      `
    const { createRequire } = require('node:module');
    const targetRequire = createRequire(${JSON.stringify(targetsPath)});
    const targets = require(${JSON.stringify(targetsPath)}).default({ browsers: ['chrome 120', 'firefox 120'] });
    const browsersPath = targetRequire.resolve('browserslist');
    const browsers = require(browsersPath)('chrome 120', { stats: { toString: { onekey: 5 }, chrome: { '120': 50 } } });
    const baseline = createRequire(browsersPath)('baseline-browser-mapping');
    let errorResult;
    try { baseline.getCompatibleVersions({ targetYear: 2020, widelyAvailableOnDate: '2020-01-01' }); }
    catch (error) { errorResult = { isError: error instanceof Error, message: error.message }; }
    console.log(JSON.stringify({ targets, browsers, errorResult }));
  `,
    ],
    { encoding: "utf8", timeout: 5000 },
  )
  expect(result.status).toBe(0)
  expect(JSON.parse(result.stdout)).toEqual({
    targets: { chrome: "120.0.0", firefox: "120.0.0" },
    browsers: ["chrome 120"],
    errorResult: {
      isError: true,
      message:
        "You cannot use targetYear and widelyAvailableOnDate at the same time.  Please remove one of these options and try again.",
    },
  })
}, 10_000)
