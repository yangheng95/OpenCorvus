import { expect, test } from "bun:test"
import { awaitNativeOperation, nativeStreamEvidence, requireScorableNativeCompletion } from "./native-run-contract"
import { ProviderError } from "../../packages/opencorvus/src/provider/error"

test("world wait settles with the exact inactivity error", async () => {
  const abort = new AbortController()
  const pending = awaitNativeOperation(new Promise(() => {}), abort.signal)
  const error = new Error("native_provider_inactivity")
  abort.abort(error)
  await expect(pending).rejects.toBe(error)
})

test("already cancelled operations settle under the original cancellation contract", async () => {
  const abort = new AbortController()
  const error = new Error("native_provider_inactivity")
  abort.abort(error)
  await expect(awaitNativeOperation(Promise.reject(new Error("world_read_failed")), abort.signal)).rejects.toBe(error)
})

test("normal operation and natural completion enter official scoring", async () => {
  const abort = new AbortController()
  expect(await awaitNativeOperation(Promise.resolve("world_ready"), abort.signal)).toBe("world_ready")
  expect(requireScorableNativeCompletion("stop", abort.signal)).toBe("ready_for_official_score")
  abort.abort(new Error("native_provider_inactivity"))
  expect(() => requireScorableNativeCompletion("tool-calls", abort.signal)).toThrow("native_provider_inactivity")
})

test("transport headers use the existing provider redaction contract", () => {
  const evidence = nativeStreamEvidence({ type: "finish-step", response: { headers: {
    "set-cookie": "session=test-value", "content-type": "text/event-stream",
  } } }, ProviderError.redactSensitiveProviderHeaders)
  expect(evidence).toEqual({ type: "finish-step", response: { headers: {
    "set-cookie": "<redacted>", "content-type": "text/event-stream",
  } } })
})
