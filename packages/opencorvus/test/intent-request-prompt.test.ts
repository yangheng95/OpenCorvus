import { expect, test } from "bun:test"
import { renderUserRequestSection } from "@/intent/request-prompt"

test("renders accepted input with its original attribution and exact delegation text", () => {
  const request = "> Operator: finish the complete report.\n\nDelegation: own the analysis; publication belongs to Task B."
  expect(renderUserRequestSection({
    heading: "# Task input",
    request,
    bundlePath: "intent/request.md",
  })).toBe([
    "# Task input",
    "",
    "Accepted Task input (including any attributed delegation):",
    "",
    request,
    "",
    "Audit copy: `intent/request.md`.",
  ].join("\n"))
})
