export const OAUTH_AUTHORIZATION_TIMEOUT_MS = 5 * 60 * 1000

/** One device grant owns its requests and waits through expiry or disposal. */
export class ManagedOAuthDeviceAuthorization {
  private readonly controller = new AbortController()
  private readonly timer: ReturnType<typeof setTimeout>
  private running: Promise<unknown> | undefined
  readonly signal = this.controller.signal

  constructor(options: { expiresIn?: number; timeoutMs?: number } = {}) {
    const maximum = options.timeoutMs ?? OAUTH_AUTHORIZATION_TIMEOUT_MS
    const expiry = options.expiresIn
    const duration =
      typeof expiry === "number" && Number.isFinite(expiry) && expiry > 0 ? Math.min(maximum, expiry * 1000) : maximum
    this.timer = setTimeout(() => this.controller.abort(new Error("Device authorization expired")), duration)
  }

  async run<T>(operation: () => Promise<T>): Promise<T> {
    this.signal.throwIfAborted()
    const running = Promise.resolve().then(operation)
    this.running = running
    try {
      const result = await running
      this.signal.throwIfAborted()
      return result
    } finally {
      clearTimeout(this.timer)
    }
  }

  async wait(milliseconds: number): Promise<void> {
    this.signal.throwIfAborted()
    await new Promise<void>((resolve, reject) => {
      const abort = () => {
        clearTimeout(timer)
        this.signal.removeEventListener("abort", abort)
        reject(this.signal.reason)
      }
      const timer = setTimeout(() => {
        this.signal.removeEventListener("abort", abort)
        resolve()
      }, milliseconds)
      this.signal.addEventListener("abort", abort, { once: true })
    })
  }

  async dispose(): Promise<void> {
    clearTimeout(this.timer)
    this.controller.abort(new Error("Device authorization disposed"))
    await this.running?.catch(() => undefined)
  }
}

interface OAuthCallbackWaitOptions {
  timeoutMs: number
  supersededError: () => Error
  timeoutError: () => Error
  onTimeout?: () => void | Promise<void>
}

export interface OAuthCallbackOwner<Context, Result> {
  readonly context: Context
  readonly signal: AbortSignal
  resolve(result: Result): void
  reject(error: Error): void
}

export interface OAuthCallbackLease<Result> {
  readonly promise: Promise<Result>
  readonly signal: AbortSignal
  /** Release the deadline after all callback-owned network work has settled. */
  complete(): void
  reject(error: Error): void
}

export class ManagedOAuthCallbackOwner<Context, Result> {
  private pending: (OAuthCallbackOwner<Context, Result> & { claimed: boolean }) | undefined

  get current(): OAuthCallbackOwner<Context, Result> | undefined {
    return this.pending
  }

  wait(context: Context, options: OAuthCallbackWaitOptions): Promise<Result> {
    const lease = this.begin(context, options)
    return lease.promise.finally(() => lease.complete())
  }

  begin(context: Context, options: OAuthCallbackWaitOptions): OAuthCallbackLease<Result> {
    this.pending?.reject(options.supersededError())

    const controller = new AbortController()
    let timeout: ReturnType<typeof setTimeout>
    const complete = () => clearTimeout(timeout)
    let owner!: OAuthCallbackOwner<Context, Result> & { claimed: boolean }
    const promise = new Promise<Result>((resolve, reject) => {
      let settled = false
      owner = {
        context,
        signal: controller.signal,
        claimed: false,
        resolve: (result) => settle(() => resolve(result)),
        reject: (error) => {
          complete()
          controller.abort(error)
          settle(() => reject(error))
        },
      }
      const settle = (complete: () => void) => {
        if (settled) return
        settled = true
        if (this.pending === owner) this.pending = undefined
        complete()
      }

      timeout = setTimeout(() => {
        owner.reject(options.timeoutError())
        void Promise.resolve()
          .then(() => options.onTimeout?.())
          .catch(() => undefined)
      }, options.timeoutMs)
      this.pending = owner
    })
    // The live executor may not await this promise until a later callback.
    // Observe rejection immediately without changing the original promise's
    // rejection semantics for that eventual consumer.
    void promise.catch(() => undefined)
    return {
      promise,
      signal: controller.signal,
      complete,
      reject: (error) => owner.reject(error),
    }
  }

  claim(): OAuthCallbackOwner<Context, Result> | undefined {
    if (!this.pending || this.pending.claimed) return
    this.pending.claimed = true
    return this.pending
  }

  reject(error: Error): boolean {
    if (!this.pending) return false
    this.pending.reject(error)
    return true
  }
}

interface ManagedListener {
  listening?: boolean
  once(event: "error", listener: (error: Error) => void): unknown
  removeListener(event: "error", listener: (error: Error) => void): unknown
  close(callback?: (error?: Error) => void): unknown
}

export class ManagedOAuthListenerOwner<Server extends ManagedListener> {
  private server: Server | undefined
  private starting: Promise<Server> | undefined
  private stopping: { server: Server; lease: object | undefined; promise: Promise<void> } | undefined
  private lease: object | undefined

  get current(): Server | undefined {
    return this.server
  }

  acquire(): object {
    const lease = {}
    this.lease = lease
    return lease
  }

  start(create: () => Server, listen: (server: Server, ready: () => void) => void): Promise<Server> {
    if (this.stopping) return this.stopping.promise.then(() => this.start(create, listen))
    if (this.server) return Promise.resolve(this.server)
    if (this.starting) return this.starting

    const starting = (async () => {
      const server = create()
      await new Promise<void>((resolve, reject) => {
        const onError = (error: Error) => {
          server.removeListener("error", onError)
          if (server.listening) server.close()
          reject(error)
        }
        const onReady = () => {
          server.removeListener("error", onError)
          resolve()
        }
        server.once("error", onError)
        try {
          listen(server, onReady)
        } catch (error) {
          onError(error instanceof Error ? error : new Error(String(error)))
        }
      })
      this.server = server
      return server
    })()
    this.starting = starting
    const clearStarting = () => {
      if (this.starting === starting) this.starting = undefined
    }
    void starting.then(clearStarting, clearStarting)
    return starting
  }

  async stop(lease?: object): Promise<void> {
    const currentStop = this.stopping
    if (currentStop) {
      if (lease && currentStop.lease !== lease) return
      return currentStop.promise
    }
    if (lease && this.lease !== lease) return
    const server = this.server
    if (!server) return
    const stopping = new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
    const owner = { server, lease: this.lease, promise: stopping }
    this.stopping = owner
    const clearStopping = () => {
      if (this.stopping === owner) this.stopping = undefined
    }
    try {
      await stopping
      if (this.server === server) this.server = undefined
      if (this.lease === owner.lease) this.lease = undefined
    } finally {
      clearStopping()
    }
  }
}
