export function awaitNativeOperation<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(signal.reason)
    operation.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort))
    if (signal.aborted) reject(signal.reason)
    else signal.addEventListener("abort", abort, { once: true })
  })
}

export function requireScorableNativeCompletion(finishReason: string, signal: AbortSignal): "ready_for_official_score" {
  if (signal.aborted) throw signal.reason
  if (!["stop", "tool-calls", "length", "content-filter"].includes(finishReason))
    throw new Error(`unscored_native_finish:${finishReason}`)
  return "ready_for_official_score"
}

export function nativeStreamEvidence(part: any, redactHeaders: (headers: Record<string, string>) => unknown): unknown {
  if (part.type === "finish-step" && part.response?.headers)
    return { ...part, response: { ...part.response, headers: redactHeaders(part.response.headers) } }
  return part
}
