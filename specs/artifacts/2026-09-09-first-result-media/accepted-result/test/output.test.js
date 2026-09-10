import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import test from "node:test"

test("the command reports the total parcel weight in grams", () => {
  const output = execFileSync(process.execPath, [fileURLToPath(new URL("../src/index.js", import.meta.url))], {
    encoding: "utf8",
  })
  assert.equal(output.trim(), "800 g")
})
