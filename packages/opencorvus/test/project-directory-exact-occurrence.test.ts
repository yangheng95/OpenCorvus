import { afterEach, expect, spyOn, test } from "bun:test"
import * as fs from "node:fs/promises"
import path from "node:path"
import { createHash, randomUUID } from "node:crypto"
import { DurablePublicationStore } from "@opencorvus-ai/util/durable-publication"
import { Global } from "@/global"
import { Instance } from "@/project/instance"
import { Worktree } from "@/worktree"
import { ProjectWorktreeDeletion } from "@/project/worktree-deletion"
import { Workspace } from "@/workspace/workspace"
import { WorkspaceLifecycleAdmissionTable } from "@/workspace/workspace.sql"
import { currentRuntimeProcessOccurrence } from "@/runtime/process-occurrence"
import z from "zod"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"
import { ProjectDirectoryAdmission } from "@/project/directory-admission"
import {
  assertProjectDeletionCleanupTargetRestored,
  projectDeletionCleanupTargetStaged,
  createProjectDeletionCleanupPlan,
  recoverProjectDeletionCleanup,
  ProjectDeletionCleanupFormatError,
  ProjectDeletionCleanupTestHooks,
} from "@/project/deletion-cleanup"
import { Project } from "@/project/project"
import { ProjectRuntimePaths } from "@/project/runtime-paths"
import { closeProjectDeletionRegistryAdmission, recoverProjectMaintenanceFences } from "@/project/deletion-registry"
import { Database, eq } from "@/storage/db"
import { ProjectMaintenanceFenceTable, ProjectTable } from "@/project/project.sql"
import { memoryProject, resetMemoryDatabase } from "./fixture/memory"
import {
  assertProjectDeletionCleanupAdmissionOpen,
  ProjectDeletionCleanupAdmissionClosedError,
} from "@/project/deletion-cleanup-admission"

const manifestPaths: string[] = []
afterEach(async () => {
  for (const manifestPath of manifestPaths.splice(0)) {
    await fs.unlink(manifestPath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error
    })
  }
  await resetMemoryDatabase()
})

async function withDirectories(fn: (source: string, quarantine: string) => Promise<void>) {
  const processRoot = process.env.OPENCORVUS_TEST_PROCESS_ROOT
  if (!processRoot) throw new Error("Directory identity tests require the repository test preload")
  const root = await createManagedTemporaryDirectory(processRoot, "directory-identity-")
  try {
    const source = path.join(root, "source")
    await fs.mkdir(source)
    await fn(source, path.join(root, "quarantine"))
  } finally {
    await removeManagedDirectoryTree(root)
  }
}

test("observes the exact staged and restored occurrence through real directory renames", async () => {
  await withDirectories(async (source, quarantine) => {
    const occurrence = await ProjectDirectoryAdmission.observeDirectory(source)
    const info = await fs.stat(source, { bigint: true })
    expect(JSON.parse(JSON.stringify(occurrence))).toEqual({
      directoryKey: await ProjectDirectoryAdmission.key(source),
      device: String(info.dev),
      inode: String(info.ino),
      birthtimeNs: String(info.birthtimeNs),
    })
    const target = { source, quarantine, occurrence }
    await fs.rename(source, quarantine)
    expect(await projectDeletionCleanupTargetStaged(target)).toBe(true)
    await fs.rename(quarantine, source)
    await assertProjectDeletionCleanupTargetRestored(target)
    expect(await ProjectDirectoryAdmission.observeDirectory(source)).toEqual(occurrence)
  })
})

test("reports an unsettled quarantine for distinct wide directory inodes with equal birth times", async () => {
  await withDirectories(async (source, quarantine) => {
    const first = 14636698791557095n
    const second = 14636698791557096n
    expect(Number(first)).toBe(Number(second))
    const originalStat = fs.stat
    const observed = spyOn(fs, "stat").mockImplementation((async (file, options) => {
      const info = await originalStat(file, options)
      if (file === source || file === quarantine) {
        const bigint = typeof info.ino === "bigint"
        Object.defineProperties(info, {
          ino: { value: bigint ? (file === source ? first : second) : Number(first) },
          birthtimeMs: { value: bigint ? 1786113031000n : 1786113031000 },
          birthtimeNs: { value: 1786113031000000000n },
        })
      }
      return info
    }) as typeof fs.stat)
    try {
      const occurrence = await ProjectDirectoryAdmission.observeDirectory(source)
      await fs.rename(source, quarantine)
      await expect(projectDeletionCleanupTargetStaged({ source, quarantine, occurrence })).rejects.toThrow(
        `Project deletion cleanup target did not settle in quarantine: ${source}`,
      )
    } finally {
      observed.mockRestore()
    }
  })
})

test("retains an unsupported numeric manifest and its maintenance authority during startup recovery", async () => {
  await using project = await memoryProject()
  const registered = await Project.fromDirectory(project.path)
  const source = ProjectRuntimePaths.projectRuntimeRoot(project.path)
  await fs.mkdir(source, { recursive: true })
  await fs.writeFile(path.join(source, "authority.txt"), "retained original")
  using admission = closeProjectDeletionRegistryAdmission(registered.project.id)
  const plan = await createProjectDeletionCleanupPlan({
    projectID: registered.project.id,
    directory: project.path,
    operationID: admission.operationID,
  })
  manifestPaths.push(plan.manifestPath)
  const legacy = {
    ...plan.manifest,
    format: "opencorvus.project-deletion-cleanup.v5",
    targets: plan.manifest.targets.map((target) => ({
      ...target,
      occurrence: target.occurrence && {
        directoryKey: target.occurrence.directoryKey,
        device: Number(target.occurrence.device),
        inode: Number(target.occurrence.inode),
        birthtimeMs: Number(BigInt(target.occurrence.birthtimeNs)) / 1_000_000,
      },
    })),
  }
  const bytes = JSON.stringify(legacy)
  await fs.writeFile(plan.manifestPath, bytes)
  await expect(assertProjectDeletionCleanupAdmissionOpen(registered.project.id)).rejects.toBeInstanceOf(
    ProjectDeletionCleanupAdmissionClosedError,
  )
  const recovery = await recoverProjectDeletionCleanup(() => "dead_or_reused")
  expect(recovery.unreconciled[0]).toBeInstanceOf(ProjectDeletionCleanupFormatError)
  expect((recovery.unreconciled[0] as InstanceType<typeof ProjectDeletionCleanupFormatError>).data).toEqual({
    manifestPath: plan.manifestPath,
    received: "opencorvus.project-deletion-cleanup.v5",
    expected: "opencorvus.project-deletion-cleanup.v6",
  })
  recoverProjectMaintenanceFences(() => "dead_or_reused", {
    preserveOperationIDs: new Set(recovery.retainedOperationIDs),
  })
  expect({
    retained: recovery.retainedOperationIDs,
    manifest: await fs.readFile(plan.manifestPath, "utf8"),
    source: await fs.readFile(path.join(source, "authority.txt"), "utf8"),
    operationID: Database.use(
      (db) =>
        db
          .select()
          .from(ProjectMaintenanceFenceTable)
          .where(eq(ProjectMaintenanceFenceTable.project_id, registered.project.id))
          .get()?.operation_id,
    ),
  }).toEqual({
    retained: [admission.operationID],
    manifest: bytes,
    source: "retained original",
    operationID: admission.operationID,
  })
}, 90_000)

test("retains prior numeric child and Workspace intents at their original recovery namespaces", async () => {
  await using project = await memoryProject()
  await Instance.provideProjectIdentity({
    directory: project.path,
    fn: async () => {
      const projectID = Instance.project.id
      const projectGeneration = Project.occurrence(projectID)!.generation
      const child = await Worktree.create({ name: "legacy-identity" })
      const current = await Worktree.captureManagedRemovalPlan({
        projectID,
        directory: child.directory,
        authority: "project_delete",
      })
      const numeric = (identity: { device: string; inode: string; birthtimeNs: string }) => ({
        device: Number(identity.device),
        inode: Number(identity.inode),
        birthtimeMs: Number(BigInt(identity.birthtimeNs)) / 1_000_000,
      })
      const { birthtimeNs: _birth, ...fields } = current
      const removal = {
        ...fields,
        version: 2,
        ...numeric(current),
        matchedSandboxes: current.matchedSandboxes.map(({ birthtimeNs: _birth, ...alias }) => ({
          ...alias,
          ...numeric({ ...alias, birthtimeNs: _birth }),
        })),
      }
      const hash = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 40)
      const databaseInstanceID = Database.Identity()
      const store = new DurablePublicationStore(path.join(Global.Path.data, "durable-publications"))
      const scopeKey =
        process.platform === "win32" ? path.resolve(child.directory).toLowerCase() : path.resolve(child.directory)
      const kind = `project-worktree-deletion-${hash(`project-worktree-deletion-scope-v1\0${databaseInstanceID}\0${projectID}\0${projectGeneration}\0${scopeKey}`)}`
      const childID = hash(
        `project-worktree-deletion-v2\0${databaseInstanceID}\0${projectID}\0${projectGeneration}\0${current.directoryKey}\0${removal.device}\0${removal.inode}\0${removal.birthtimeMs}`,
      )
      const payload = {
        version: 2,
        databaseInstanceID,
        projectID,
        projectGeneration,
        scopeKey,
        directoryKey: current.directoryKey,
        predecessorOccurrenceID: null,
        removal,
      }
      await store.create({
        occurrenceID: childID,
        kind,
        subject: `project-worktrees:${databaseInstanceID}:${projectID}:${projectGeneration}`,
        payload,
        timeCreated: Date.now(),
      })
      await expect(
        ProjectWorktreeDeletion.prepare({ projectID, projectGeneration, directory: child.directory }),
      ).rejects.toBeInstanceOf(z.ZodError)
      expect((await store.read(kind, childID)).intent.payload).toEqual(payload)
      await store.settle(kind, { occurrenceID: childID, outcome: "committed", payload: {}, timeCreated: Date.now() })
      expect(await Worktree.removeProjectWorktree({ directory: child.directory })).toEqual(
        expect.objectContaining({ receipt: { ok: true, status: "removed" } }),
      )
      await expect(
        ProjectWorktreeDeletion.prepare({ projectID, projectGeneration, directory: child.directory }),
      ).rejects.toBeInstanceOf(z.ZodError)
      const recreated = await Worktree.create({ name: "legacy-identity" })
      expect(recreated.directory).toBe(child.directory)
      await expect(
        ProjectWorktreeDeletion.prepare({ projectID, projectGeneration, directory: child.directory }),
      ).rejects.toBeInstanceOf(z.ZodError)
      expect((await store.read(kind, childID)).terminal?.outcome).toBe("committed")

      const workspaceID = "wrk_legacy_identity"
      const workspaceKind = `workspace-lifecycle-${hash(`workspace-lifecycle-scope-v1\0${databaseInstanceID}\0${projectID}\0${workspaceID}`)}`
      const workspaceOccurrenceID = hash(
        `workspace-lifecycle-v1\0${databaseInstanceID}\0${projectID}\0${workspaceID}\0deleting`,
      )
      const workspacePayload = {
        version: 1,
        lifecycle: "deleting",
        databaseInstanceID,
        projectID,
        projectGeneration,
        workspaceID,
        workspace: {
          id: workspaceID,
          projectID,
          branch: child.branch,
          config: { directory: child.directory, type: "worktree" },
        },
        removal,
      }
      await store.create({
        occurrenceID: workspaceOccurrenceID,
        kind: workspaceKind,
        subject: `workspace:${databaseInstanceID}:${projectID}:${workspaceID}`,
        payload: workspacePayload,
        timeCreated: Date.now(),
      })
      const owner = currentRuntimeProcessOccurrence()
      Database.use((db) =>
        db
          .insert(WorkspaceLifecycleAdmissionTable)
          .values({
            occurrence_id: workspaceOccurrenceID,
            project_id: projectID,
            project_generation: projectGeneration,
            workspace_id: workspaceID,
            lifecycle: "deleting",
            authority: "project_delete",
            owner_occurrence_id: owner.occurrenceID,
            owner_pid: owner.pid,
            owner_process_instance_id: owner.processInstanceID,
            time_created: Date.now(),
          })
          .run(),
      )
      await expect(Workspace.recoverOpenLifecycles(() => "dead_or_reused")).rejects.toBeInstanceOf(z.ZodError)
      expect({
        payload: (await store.read(workspaceKind, workspaceOccurrenceID)).intent.payload,
        frontier: Database.use(
          (db) =>
            db
              .select()
              .from(WorkspaceLifecycleAdmissionTable)
              .where(eq(WorkspaceLifecycleAdmissionTable.occurrence_id, workspaceOccurrenceID))
              .get()?.occurrence_id,
        ),
        directory: (await fs.stat(child.directory)).isDirectory(),
      }).toEqual({ payload: workspacePayload, frontier: workspaceOccurrenceID, directory: true })
    },
  })
}, 90_000)

test("retains a completed prior-format cleanup receipt as inert history during recovery", async () => {
  await using project = await memoryProject()
  const registered = await Project.fromDirectory(project.path)
  const source = ProjectRuntimePaths.projectRuntimeRoot(project.path)
  await fs.mkdir(source, { recursive: true })
  const plan = await createProjectDeletionCleanupPlan({ projectID: registered.project.id, directory: project.path })
  manifestPaths.push(plan.manifestPath)
  await fs.rename(source, plan.manifest.targets[0]!.quarantine)
  Database.use((db) => db.delete(ProjectTable).where(eq(ProjectTable.id, registered.project.id)).run())
  expect(await recoverProjectDeletionCleanup(() => "dead_or_reused")).toEqual({
    unreconciled: [],
    retainedOperationIDs: [],
  })
  const completedPath = path.join(ProjectDeletionCleanupTestHooks.completedRoot(), path.basename(plan.manifestPath))
  manifestPaths.push(completedPath)
  const legacy = {
    ...plan.manifest,
    format: "opencorvus.project-deletion-cleanup.v5",
    targets: plan.manifest.targets.map((target) => ({
      ...target,
      occurrence: target.occurrence && {
        directoryKey: target.occurrence.directoryKey,
        device: Number(target.occurrence.device),
        inode: Number(target.occurrence.inode),
        birthtimeMs: Number(BigInt(target.occurrence.birthtimeNs)) / 1_000_000,
      },
    })),
  }
  const bytes = JSON.stringify(legacy)
  await fs.writeFile(completedPath, bytes)
  const quarantine = plan.manifest.targets[0]!.quarantine
  await fs.mkdir(quarantine)
  await fs.writeFile(path.join(quarantine, "replacement.txt"), "independent replacement")
  const recovery = await recoverProjectDeletionCleanup(() => "dead_or_reused")
  expect(recovery).toEqual({ unreconciled: [], retainedOperationIDs: [] })
  expect({ retained: recovery.retainedOperationIDs, receipt: await fs.readFile(completedPath, "utf8") }).toEqual({
    retained: [],
    receipt: bytes,
  })
  expect(await fs.readFile(path.join(quarantine, "replacement.txt"), "utf8")).toBe("independent replacement")
  const otherOperation = randomUUID()
  await fs.writeFile(completedPath, JSON.stringify({ ...legacy, operationID: otherOperation }))
  const mismatched = await recoverProjectDeletionCleanup(() => "dead_or_reused")
  expect((mismatched.unreconciled[0] as Error).message).toBe(
    `Completed Project deletion receipt path does not match operation ${otherOperation}`,
  )
  await fs.writeFile(completedPath, JSON.stringify({ ...legacy, format: "opencorvus.project-deletion-cleanup.v999" }))
  const unknown = await recoverProjectDeletionCleanup(() => "dead_or_reused")
  expect(unknown.unreconciled[0]).toBeInstanceOf(ProjectDeletionCleanupFormatError)
}, 90_000)
