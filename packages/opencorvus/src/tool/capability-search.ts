import { CapabilitySearchInput } from "@/capability/descriptor"
import { CAPABILITY_REVEAL_OWNER_EXTRA_KEY, type CapabilityRevealOwner } from "@/capability/reveal-owner"
import { Tool } from "./tool"

export const CAPABILITY_SEARCH_TOOL_ID = "capability_search" as const
export const CAPABILITY_SEARCH_DESCRIPTION =
  'Discover specialist or extension capabilities not already callable. Use available routine tools directly. Reveal up to five known exact_refs together for the next model step; refs must match the frozen catalog and grants. Search unknown refs by name or purpose; never guess owners. Deactivate unused extensions. Non-empty structural filters are ANDed; empty filters do not narrow. queries=[""] returns a bounded window. search_window reports candidate, matched and returned counts; refine incomplete searches. For held Expert Squads use kinds=["expert_squad"] and omit next_owner_kinds or use ["create_task_with_expert_squad"]. Search is not execution or approval; fuzzy hits do not activate tools.'

export const CapabilitySearchTool = Tool.define(CAPABILITY_SEARCH_TOOL_ID, async () => {
  return {
    description: CAPABILITY_SEARCH_DESCRIPTION,
    parameters: CapabilitySearchInput,
    async execute(params, ctx) {
      const owner = ctx.extra?.[CAPABILITY_REVEAL_OWNER_EXTRA_KEY] as CapabilityRevealOwner | undefined
      const toolPartID = typeof ctx.extra?.toolPartID === "string" ? ctx.extra.toolPartID : undefined
      if (!owner || !toolPartID) {
        throw new Error("capability_search requires its occurrence-bound reveal owner and ToolPart identity.")
      }
      return owner.execute(params, {
        callID: ctx.callID,
        messageID: ctx.messageID,
        sessionID: ctx.sessionID,
        toolPartID,
      })
    },
  }
})
