import { describe, expect, test } from "bun:test"
import { ManagedOAuthDeviceAuthorization } from "@/plugin/oauth-lifecycle"
import { CodexAuthPlugin } from "@/plugin/openai/codex"
import { CopilotAuthPlugin } from "@/plugin/github-copilot/copilot"
import { XaiAuthPlugin } from "@/plugin/xai"
import type { PluginInput } from "@opencorvus-ai/plugin"
import { ProviderAuth } from "@/provider/auth"
import { ProviderCredentialExchange } from "@/provider/credential-exchange"
import { ProviderOAuthFlowStore } from "@/provider/oauth-flow-store"

describe.serial("Device authorization lifetime", () => {
  test("device expiry reaches the production failed occurrence and releases admission", async () => {
    const provider = "device-lifetime-test"
    using hooks = ProviderAuth.TestHooks.installGlobalAuthHooksForTest([
      {
        auth: {
          provider,
          methods: [
            {
              type: "oauth",
              label: "Device",
              authorize: async () => {
                const lifetime = new ManagedOAuthDeviceAuthorization({ timeoutMs: 150 })
                return {
                  url: "https://example.test/device",
                  instructions: "Complete device authorization",
                  method: "auto" as const,
                  dispose: () => lifetime.dispose(),
                  callback: () =>
                    lifetime.run(async () => {
                      await lifetime.wait(60_000)
                      return { type: "failed" as const }
                    }),
                }
              },
            },
          ],
        },
      },
    ])
    for (let attempt = 0; attempt < 2; attempt++) {
      const authorization = await ProviderAuth.authorize({ providerID: provider, method: 0, scope: "global" })
      await expect(
        ProviderAuth.callback({ providerID: provider, method: 0, flowID: authorization.flowID, scope: "global" }),
      ).rejects.toThrow(ProviderCredentialExchange.FailedError)
      expect(await ProviderOAuthFlowStore.get(authorization.flowID)).toMatchObject({
        state: "failed",
        error: "Provider credential exchange failed before producing a credential",
      })
    }
  })

  test("disposal interrupts an actual local HTTP response body", async () => {
    let bodyStarted!: () => void
    const started = new Promise<void>((resolve) => {
      bodyStarted = resolve
    })
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: 0,
      fetch: () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode("pending"))
            },
          }),
        ),
    })
    const lifetime = new ManagedOAuthDeviceAuthorization()
    const request = lifetime
      .run(async () => {
        const response = await fetch(server.url, { signal: lifetime.signal })
        bodyStarted()
        return response.text()
      })
      .catch((error: Error) => error)
    try {
      await started
      await lifetime.dispose()
      expect(await request).toBeInstanceOf(Error)
      expect(lifetime.signal.reason.message).toBe("Device authorization disposed")
    } finally {
      await lifetime.dispose()
      await server.stop(true)
    }
  })
  test("provider expiry settles an active polling wait", async () => {
    const lifetime = new ManagedOAuthDeviceAuthorization({ expiresIn: 0.02 })
    await expect(lifetime.run(() => lifetime.wait(60_000))).rejects.toThrow("Device authorization expired")
    expect(lifetime.signal.reason.message).toBe("Device authorization expired")
    await lifetime.dispose()
  })

  test("disposal drains a waiting callback and preserves its cancellation reason", async () => {
    const lifetime = new ManagedOAuthDeviceAuthorization()
    const callback = lifetime.run(() => lifetime.wait(60_000))
    const rejected = callback.catch((error: Error) => error)
    await lifetime.dispose()
    expect(await rejected).toMatchObject({ message: "Device authorization disposed" })
    expect(lifetime.signal.reason.message).toBe("Device authorization disposed")
  })

  test("successful work returns its credential result", async () => {
    const lifetime = new ManagedOAuthDeviceAuthorization()
    expect(await lifetime.run(async () => ({ type: "success", key: "test-key" }))).toEqual({
      type: "success",
      key: "test-key",
    })
    await lifetime.dispose()
  })

  test.each(["openai", "copilot", "xai"])(
    "%s device callback binds its token request to executor disposal",
    async (provider) => {
      const originalFetch = globalThis.fetch
      let began!: () => void
      const started = new Promise<void>((resolve) => {
        began = resolve
      })
      const events: string[] = []
      globalThis.fetch = (async (_input: unknown, init?: RequestInit) => {
        if (!init?.signal)
          return Response.json({
            device_auth_id: "test-device",
            device_code: "test-device",
            user_code: "test-code",
            verification_uri: "https://example.test/device",
            interval: 5,
            expires_in: 300,
          })
        const signal = init.signal
        events.push("polling")
        began()
        return new Promise<Response>((_resolve, reject) => {
          const cancel = () => {
            events.push("aborted")
            reject(signal.reason)
          }
          if (signal.aborted) cancel()
          else signal.addEventListener("abort", cancel, { once: true })
        })
      }) as typeof fetch
      try {
        const input = {} as PluginInput
        const plugin =
          provider === "openai"
            ? await CodexAuthPlugin(input)
            : provider === "copilot"
              ? await CopilotAuthPlugin(input)
              : await XaiAuthPlugin(input)
        const method = plugin.auth!.methods[provider === "copilot" ? 0 : 1]
        if (method.type !== "oauth") throw new Error("Expected device OAuth method")
        const authorization = await method.authorize({ deploymentType: "github.com" })
        if (authorization.method !== "auto") throw new Error("Expected automatic device callback")
        const callback = authorization.callback()
        const rejected = callback.catch((error: Error) => error)
        await started
        await authorization.dispose!()
        expect(await rejected).toMatchObject({ message: "Device authorization disposed" })
        expect(events).toEqual(["polling", "aborted"])
      } finally {
        globalThis.fetch = originalFetch
      }
    },
  )
})
