import { afterEach, describe, expect, test } from "bun:test"
import crypto from "node:crypto"
import { Auth } from "@/auth"
import { ProviderAuth } from "@/provider/auth"
import { ProviderCredentialExchange } from "@/provider/credential-exchange"
import { ProviderOAuthFlowStore as Store } from "@/provider/oauth-flow-store"

afterEach(() => {
  ProviderAuth.TestHooks.pendingRenewalIntervalMs = undefined
  Store.TestHooks.beforeRenewPending = undefined
})

async function opened(providerID = crypto.randomUUID(), credentialProviderID = providerID) {
  return Store.open({
    providerID,
    credentialProviderID,
    expectedCredentialGeneration: (await Auth.observe(credentialProviderID)).generation,
    ownerID: crypto.randomUUID(),
    scope: "global",
    method: 0,
    inputsDigest: "local-test",
  })
}

async function failed(id: string) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const flow = await Store.get(id)
    if (flow?.state === "failed") return flow
    await Bun.sleep(10)
  }
  throw new Error("Pending authorization did not settle")
}

describe.serial("Pending authorization deadline", () => {
  test("a renewal observation crossing the deadline settles and disposes preparation", async () => {
    ProviderAuth.TestHooks.pendingRenewalIntervalMs = 60_000
    const providerID = crypto.randomUUID()
    const originalNow = Date.now
    const events: string[] = []
    using installed = ProviderAuth.TestHooks.installGlobalAuthHooksForTest([
      {
        auth: {
          provider: providerID,
          methods: [
            {
              type: "oauth",
              label: "Local",
              authorize: async () => ({
                method: "auto" as const,
                url: "https://example.test",
                instructions: "local",
                dispose: async () => {
                  events.push("disposed")
                },
                callback: async () => ({ type: "success" as const, key: "local-key" }),
              }),
            },
          ],
        },
      },
    ])
    Store.TestHooks.beforeRenewPending = async () => {
      const afterDeadline = originalNow() + Store.PENDING_AUTHORIZATION_TIMEOUT_MS + 1
      Date.now = () => afterDeadline
      throw new Error("transient renewal observation")
    }
    try {
      const result = await ProviderAuth.authorize({ providerID, scope: "global", method: 0 }).catch(
        (error: Error) => error,
      )
      expect(result).toMatchObject({ message: "Provider OAuth authorization occurrence lost its executor owner" })
      expect(events).toEqual(["disposed"])
      expect(await Store.TestHooks.latestFor(providerID, "authorization")).toMatchObject({ state: "failed" })
    } finally {
      Date.now = originalNow
      Store.TestHooks.beforeRenewPending = undefined
    }
  })

  test("renewal caps the pending lease and an admitted exchange owns its independent lease", async () => {
    const flow = await opened()
    for (const elapsed of [100_000, 200_000, 250_000]) {
      await Store.renewPending({ id: flow.id, ownerID: flow.exchangeOwnerID!, now: flow.timeCreated + elapsed })
    }
    const deadline = flow.timeCreated + Store.PENDING_AUTHORIZATION_TIMEOUT_MS
    expect(await Store.get(flow.id)).toMatchObject({ state: "pending", exchangeLeaseExpiresAt: deadline })
    expect(await Store.beginExchange({ id: flow.id, ownerID: flow.exchangeOwnerID!, now: deadline - 1 })).toMatchObject(
      {
        state: "exchanging",
        exchangeLeaseExpiresAt: deadline - 1 + Store.EXCHANGE_LEASE_MS,
      },
    )
    expect(await Store.renewExchange({ id: flow.id, ownerID: flow.exchangeOwnerID!, now: deadline + 1 })).toMatchObject(
      {
        state: "exchanging",
        exchangeLeaseExpiresAt: deadline + 1 + Store.EXCHANGE_LEASE_MS,
      },
    )
  })

  test("an expired aliased pending grant admits target refresh with exact failed history", async () => {
    const provider = crypto.randomUUID()
    const target = crypto.randomUUID()
    const flow = await opened(provider, target)
    const expired = await Store.TestHooks.expirePendingAuthorization(flow.id)
    expect(expired!.exchangeLeaseExpiresAt!).toBeGreaterThan(Date.now())
    const refresh = await Store.openRefresh({
      providerID: target,
      expectedCredentialGeneration: (await Auth.observe(target)).generation,
      inputsDigest: "refresh-local",
      ownerID: crypto.randomUUID(),
    })
    expect(refresh).toMatchObject({ state: "exchanging", operation: "refresh", providerID: target })
    expect(await Store.get(flow.id)).toMatchObject({ state: "failed", timeSettled: expect.any(Number) })
  })

  for (const scope of ["global", "project"] as const) {
    for (const cleanup of [
      "renewal",
      "admission",
      "callback",
      ...(scope === "project" ? (["instance"] as const) : []),
    ] as const) {
      test(`${scope} ${cleanup} settles and disposes expired pending before a new grant completes`, async () => {
        ProviderAuth.TestHooks.pendingRenewalIntervalMs = cleanup === "renewal" ? 5 : 60_000
        const providerID = crypto.randomUUID()
        const events: string[] = []
        let ordinal = 0
        const hooks = [
          {
            auth: {
              provider: providerID,
              methods: [
                {
                  type: "oauth" as const,
                  label: "Local",
                  authorize: async () => {
                    const current = ++ordinal
                    events.push(`prepare:${current}`)
                    return {
                      method: "auto" as const,
                      url: "https://example.test",
                      instructions: "local",
                      dispose: async () => {
                        events.push(`dispose:${current}`)
                      },
                      callback: async () => ({ type: "success" as const, key: "local-key" }),
                    }
                  },
                },
              ],
            },
          },
        ]
        using installed =
          scope === "global"
            ? ProviderAuth.TestHooks.installGlobalAuthHooksForTest(hooks)
            : ProviderAuth.TestHooks.installProjectAuthHooksForTest(hooks)
        const first = await ProviderAuth.authorize({ providerID, scope, method: 0 })
        await Store.TestHooks.expirePendingAuthorization(first.flowID)
        if (cleanup === "instance") await ProviderAuth.TestHooks.disposeProjectAuthStateForTest()
        if (cleanup === "callback") {
          await expect(ProviderAuth.callback({ providerID, scope, method: 0, flowID: first.flowID })).rejects.toThrow(
            ProviderCredentialExchange.FailedError,
          )
        }
        if (cleanup === "renewal") {
          await failed(first.flowID)
          for (let attempt = 0; events.length < 2 && attempt < 100; attempt++) await Bun.sleep(10)
        }
        const next = await ProviderAuth.authorize({ providerID, scope, method: 0 })
        await ProviderAuth.callback({ providerID, scope, method: 0, flowID: next.flowID })
        expect(events).toEqual(["prepare:1", "dispose:1", "prepare:2", "dispose:2"])
        expect(await Store.get(first.flowID)).toMatchObject({ state: "failed" })
        expect(await Store.get(next.flowID)).toMatchObject({ state: "consumed" })
      })
    }
  }

  test.each(["renewal", "preparation"])("%s settles and disposes late preparation", async (cleanup) => {
    ProviderAuth.TestHooks.pendingRenewalIntervalMs = cleanup === "renewal" ? 5 : 60_000
    const providerID = crypto.randomUUID()
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    let started!: () => void
    const starting = new Promise<void>((resolve) => {
      started = resolve
    })
    const events: string[] = []
    using installed = ProviderAuth.TestHooks.installGlobalAuthHooksForTest([
      {
        auth: {
          provider: providerID,
          methods: [
            {
              type: "oauth",
              label: "Late",
              authorize: async () => {
                started()
                await gate
                return {
                  method: "auto" as const,
                  url: "https://example.test",
                  instructions: "local",
                  dispose: async () => {
                    events.push("disposed")
                  },
                  callback: async () => ({ type: "success" as const, key: "local-key" }),
                }
              },
            },
          ],
        },
      },
    ])
    const result = ProviderAuth.authorize({ providerID, scope: "global", method: 0 }).catch((error: Error) => error)
    await starting
    const flow = await Store.TestHooks.pendingFor(providerID, "global")
    await Store.TestHooks.expirePendingAuthorization(flow!.id)
    if (cleanup === "renewal") await failed(flow!.id)
    release()
    expect(await result).toMatchObject({ message: "Provider OAuth authorization occurrence lost its executor owner" })
    expect(events).toEqual(["disposed"])
    expect(await Store.get(flow!.id)).toMatchObject({ state: "failed" })
  })
})
