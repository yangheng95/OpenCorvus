import { describe, expect, test } from "bun:test"
import type { PluginInput } from "@opencorvus-ai/plugin"
import { ManagedOAuthCallbackOwner } from "@/plugin/oauth-lifecycle"
import { GitlabAuthPlugin, GitlabAuthTestHooks } from "@/plugin/gitlab"
import { ProviderAuth } from "@/provider/auth"
import { ProviderOAuthFlowStore } from "@/provider/oauth-flow-store"
import { ProviderCredentialExchange } from "@/provider/credential-exchange"

describe.serial("Browser authorization lifetime", () => {
  const options = {
    timeoutMs: 100,
    supersededError: () => new Error("superseded"),
    timeoutError: () => new Error("expired"),
  }

  test("the same deadline aborts HTTP body consumption after callback data arrives", async () => {
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch: () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode("partial"))
            },
          }),
        ),
    })
    const owner = new ManagedOAuthCallbackOwner<{}, string>()
    const lease = owner.begin({}, options)
    owner.claim()!.resolve("code")
    try {
      expect(await lease.promise).toBe("code")
      const response = await fetch(server.url, { signal: lease.signal })
      const error = await response.text().catch((error: Error) => error)
      expect(error).toBeInstanceOf(Error)
      expect(lease.signal.reason.message).toBe("expired")
    } finally {
      lease.complete()
      await server.stop(true)
    }
  })

  test("supersession rejects the previous callback and the new owner completes", async () => {
    const owner = new ManagedOAuthCallbackOwner<{}, string>()
    const first = owner.begin({}, options)
    const error = first.promise.catch((error: Error) => error)
    const next = owner.begin({}, options)
    owner.claim()!.resolve("credential")
    expect(await error).toMatchObject({ message: "superseded" })
    expect(first.signal.reason.message).toBe("superseded")
    expect(await next.promise).toBe("credential")
    next.complete()
  })

  test("disposal after code delivery aborts the exact resource lease", async () => {
    const owner = new ManagedOAuthCallbackOwner<{}, string>()
    const lease = owner.begin({}, options)
    owner.claim()!.resolve("code")
    expect(await lease.promise).toBe("code")
    lease.reject(new Error("disposed"))
    expect(() => lease.signal.throwIfAborted()).toThrow("disposed")
    lease.complete()
  })

  test("completion releases the deadline while preserving the successful result", async () => {
    const owner = new ManagedOAuthCallbackOwner<{}, string>()
    const lease = owner.begin({}, { ...options, timeoutMs: 10 })
    owner.claim()!.resolve("credential")
    const result = await lease.promise
    lease.complete()
    await new Promise((resolve) => setTimeout(resolve, 25))
    lease.signal.throwIfAborted()
    expect(result).toBe("credential")
  })

  test("GitLab token HTTP expiry settles the production flow and a fresh grant commits", async () => {
    let complete = false
    let requests = 0
    const tokenServer = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch: () => {
        requests++
        if (complete)
          return Response.json({ access_token: "local-access", refresh_token: "local-refresh", expires_in: 3600 })
        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('{"access_token":'))
            },
          }),
          { headers: { "Content-Type": "application/json" } },
        )
      },
    })
    GitlabAuthTestHooks.oauthPort = 0
    GitlabAuthTestHooks.callbackTimeoutMs = 1000
    GitlabAuthTestHooks.openBrowser = async () => undefined
    using hooks = ProviderAuth.TestHooks.installGlobalAuthHooksForTest([await GitlabAuthPlugin({} as PluginInput)])
    try {
      for (const expectedState of ["failed", "consumed"] as const) {
        const auth = await ProviderAuth.authorize({
          providerID: "gitlab",
          method: 0,
          scope: "global",
          inputs: { instanceUrl: tokenServer.url.origin },
        })
        const result = ProviderAuth.callback({
          providerID: "gitlab",
          method: 0,
          scope: "global",
          flowID: auth.flowID,
        }).catch((error: Error) => error)
        const url = new URL(auth.url)
        const callback = new URL(url.searchParams.get("redirect_uri")!)
        callback.searchParams.set("state", url.searchParams.get("state")!)
        callback.searchParams.set("code", "local-code")
        expect((await fetch(callback)).status).toBe(200)
        const outcome = await result
        if (expectedState === "failed") expect(outcome).toBeInstanceOf(ProviderCredentialExchange.FailedError)
        expect(await ProviderOAuthFlowStore.get(auth.flowID)).toMatchObject({ state: expectedState })
        complete = true
      }
      expect(requests).toBe(2)
    } finally {
      GitlabAuthTestHooks.oauthPort = undefined
      GitlabAuthTestHooks.callbackTimeoutMs = undefined
      GitlabAuthTestHooks.openBrowser = undefined
      await tokenServer.stop(true)
    }
  })
})
