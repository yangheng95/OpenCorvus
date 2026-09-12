import { expect, test } from "bun:test"
import { automationBenchCaseSetAuthority } from "../../script/benchmark/external-agent/contract"

const expected = { sha256: "a".repeat(64), canonical_sha256: "b".repeat(64) }
const input = {
  caseCount: 100,
  sealedSHA256: expected.sha256,
  sealedCanonicalSHA256: expected.canonical_sha256,
  expected,
}

for (const caseIndex of [1, 50, 51, 100]) {
  test(`case ${caseIndex} belongs to the same explicitly selected 100-case authority`, () => {
    expect(automationBenchCaseSetAuthority({ ...input, caseIndex })).toEqual({ passed: true, violations: [] })
  })
}

test("a previous subset digest returns an exact manifest authority error", () => {
  expect(automationBenchCaseSetAuthority({ ...input, caseIndex: 1, sealedSHA256: "c".repeat(64) })).toEqual({
    passed: false,
    violations: ["case_set_authority_mismatch"],
  })
})

test("an unrelated canonical digest returns an exact manifest authority error", () => {
  expect(automationBenchCaseSetAuthority({ ...input, caseIndex: 1, sealedCanonicalSHA256: "c".repeat(64) })).toEqual({
    passed: false,
    violations: ["case_set_authority_mismatch"],
  })
})

for (const caseIndex of [0, 101]) {
  test(`case ${caseIndex} returns the selected manifest range error`, () => {
    expect(automationBenchCaseSetAuthority({ ...input, caseIndex })).toEqual({
      passed: false,
      violations: ["case_index_out_of_manifest"],
    })
  })
}
