import { resolve, toNamespacedPath } from "node:path"

function nativeError(message: string, code: string, errno?: number): NodeJS.ErrnoException {
  return Object.assign(new Error(message), { code, errno })
}

function posixCode(errno: number): string {
  if (errno === 2) return "ENOENT"
  if (errno === 13) return "EACCES"
  if (errno === 16) return "EBUSY"
  if (errno === 17) return "EEXIST"
  if (errno === 18) return "EXDEV"
  if (errno === 20) return "ENOTDIR"
  if (errno === 22) return "EINVAL"
  if (errno === 39 || errno === 66) return "ENOTEMPTY"
  return `ERRNO_${errno}`
}

function windowsCode(error: number): string {
  if (error === 2 || error === 3) return "ENOENT"
  if (error === 5) return "EACCES"
  if (error === 17) return "EXDEV"
  if (error === 32 || error === 33) return "EBUSY"
  if (error === 80 || error === 183) return "EEXIST"
  if (error === 87) return "EINVAL"
  if (error === 145) return "ENOTEMPTY"
  if (error === 267) return "ENOTDIR"
  return `WIN32_${error}`
}

function cString(value: string): Buffer {
  return Buffer.from(`${value}\0`, "utf8")
}

function wideString(value: string): Uint16Array {
  const result = new Uint16Array(value.length + 1)
  for (let index = 0; index < value.length; index++) result[index] = value.charCodeAt(index)
  return result
}

async function renameDarwin(source: string, target: string): Promise<void> {
  const { dlopen, read } = await import("bun:ffi")
  const library = dlopen("/usr/lib/libSystem.B.dylib", {
    renamex_np: { args: ["ptr", "ptr", "u32"], returns: "i32" },
    __error: { args: [], returns: "ptr" },
  })
  try {
    const result = library.symbols.renamex_np(cString(source), cString(target), 0x00000004)
    if (result === 0) return
    const errnoPointer = library.symbols.__error()
    if (!errnoPointer) throw new Error("renamex_np failed without an errno pointer")
    const errno = read.i32(errnoPointer, 0)
    throw nativeError(`renamex_np failed for ${source} -> ${target}`, posixCode(errno), errno)
  } finally {
    library.close()
  }
}

function linuxLibraries(): string[] {
  const architecture = process.arch === "arm64" ? "aarch64" : process.arch === "x64" ? "x86_64" : process.arch
  return [
    "libc.so.6",
    `libc.musl-${architecture}.so.1`,
    `/lib/ld-musl-${architecture}.so.1`,
    `/usr/lib/ld-musl-${architecture}.so.1`,
  ]
}

async function renameLinux(source: string, target: string): Promise<void> {
  const { dlopen, read } = await import("bun:ffi")
  let lastLoadError: unknown
  for (const candidate of linuxLibraries()) {
    try {
      const library = dlopen(candidate, {
        renameat2: { args: ["i32", "ptr", "i32", "ptr", "u32"], returns: "i32" },
        __errno_location: { args: [], returns: "ptr" },
      })
      try {
        const result = library.symbols.renameat2(-100, cString(source), -100, cString(target), 1)
        if (result === 0) return
        const errnoPointer = library.symbols.__errno_location()
        if (!errnoPointer) throw new Error("renameat2 failed without an errno pointer")
        const errno = read.i32(errnoPointer, 0)
        throw nativeError(`renameat2 failed for ${source} -> ${target}`, posixCode(errno), errno)
      } finally {
        library.close()
      }
    } catch (error) {
      if (typeof (error as NodeJS.ErrnoException | undefined)?.errno === "number") throw error
      lastLoadError = error
    }
  }
  throw new Error("Linux renameat2(RENAME_NOREPLACE) is unavailable in the active libc", {
    cause: lastLoadError,
  })
}

async function renameWindows(source: string, target: string, writeThrough: boolean): Promise<void> {
  const { dlopen } = await import("bun:ffi")
  const library = dlopen("kernel32.dll", {
    MoveFileExW: { args: ["ptr", "ptr", "u32"], returns: "bool" },
    GetLastError: { args: [], returns: "u32" },
  })
  try {
    if (library.symbols.MoveFileExW(wideString(source), wideString(target), writeThrough ? 0x00000008 : 0)) return
    const error = library.symbols.GetLastError()
    throw nativeError(`MoveFileExW failed for ${source} -> ${target}`, windowsCode(error), error)
  } finally {
    library.close()
  }
}

async function replaceWindows(source: string, target: string, writeThrough: boolean): Promise<void> {
  if (source.includes("\0") || target.includes("\0")) throw nativeError("Invalid rename path", "EINVAL")
  const { dlopen } = await import("bun:ffi")
  const library = dlopen("kernel32.dll", {
    CreateFileW: { args: ["ptr", "u32", "u32", "ptr", "u32", "u32", "ptr"], returns: "i64" },
    SetFileInformationByHandle: { args: ["i64", "u32", "ptr", "u32"], returns: "bool" },
    FlushFileBuffers: { args: ["i64"], returns: "bool" },
    CloseHandle: { args: ["i64"], returns: "bool" },
    GetLastError: { args: [], returns: "u32" },
  })
  const fail = (operation: string) => {
    const error = library.symbols.GetLastError()
    return nativeError(`${operation} failed for ${source} -> ${target}`, windowsCode(error), error)
  }
  try {
    // DELETE, plus GENERIC_WRITE for the durable post-rename flush. Share all
    // access and open the existing source; the caller already wrote its bytes.
    const handle = library.symbols.CreateFileW(
      wideString(toNamespacedPath(resolve(source))),
      writeThrough ? 0x40010000 : 0x00010000,
      7,
      null,
      3,
      writeThrough ? 0x80000080 : 0x80,
      null,
    )
    if (handle === -1n) throw fail("CreateFileW")
    try {
      // FILE_RENAME_INFO on supported 64-bit Windows: flags at 0, root at 8,
      // name byte length at 16, UTF-16 name at 20, sizeof(struct) = 24.
      const name = Buffer.from(toNamespacedPath(resolve(target)), "utf16le")
      const info = Buffer.alloc(24 + name.length)
      // REPLACE_IF_EXISTS | POSIX_SEMANTICS keeps already-open readers valid.
      info.writeUInt32LE(3, 0)
      info.writeUInt32LE(name.length, 16)
      name.copy(info, 20)
      if (!library.symbols.SetFileInformationByHandle(handle, 22, info, info.length)) {
        throw fail("SetFileInformationByHandle(FileRenameInfoEx)")
      }
      if (writeThrough && !library.symbols.FlushFileBuffers(handle)) throw fail("FlushFileBuffers")
    } finally {
      library.symbols.CloseHandle(handle)
    }
  } finally {
    library.close()
  }
}

/** Atomically replace a file while preserving existing readers of the old file. */
export async function renameReplace(source: string, target: string): Promise<void> {
  if (process.platform === "win32") return replaceWindows(source, target, false)
  const { rename } = await import("node:fs/promises")
  await rename(source, target)
}

/**
 * Perform one operating-system rename that fails when the destination exists.
 * No existence check, destination reservation, copy, or replace fallback is
 * permitted here: callers depend on a single atomic namespace operation.
 */
export async function renameNoReplace(source: string, target: string): Promise<void> {
  if (process.platform === "darwin") return renameDarwin(source, target)
  if (process.platform === "linux") return renameLinux(source, target)
  if (process.platform === "win32") return renameWindows(source, target, false)
  throw new Error(`Atomic rename-no-replace is unsupported on ${process.platform}`)
}

/**
 * Publish one same-volume namespace move with persistence semantics. Windows
 * uses MOVEFILE_WRITE_THROUGH; POSIX callers must fsync the affected parent
 * directories after the atomic rename.
 */
export async function renameNoReplaceWriteThrough(source: string, target: string): Promise<void> {
  if (process.platform === "darwin") return renameDarwin(source, target)
  if (process.platform === "linux") return renameLinux(source, target)
  if (process.platform === "win32") return renameWindows(source, target, true)
  throw new Error(`Durable atomic rename-no-replace is unsupported on ${process.platform}`)
}

/** Atomically replace one same-volume target. Windows requests write-through;
 * POSIX callers fsync the affected directories after this namespace change. */
export async function renameReplaceWriteThrough(source: string, target: string): Promise<void> {
  if (process.platform === "win32") return replaceWindows(source, target, true)
  if (process.platform === "darwin" || process.platform === "linux") {
    const { rename } = await import("node:fs/promises")
    await rename(source, target)
    return
  }
  throw new Error(`Durable atomic rename-replace is unsupported on ${process.platform}`)
}
