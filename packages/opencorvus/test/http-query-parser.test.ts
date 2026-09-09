import { expect, test } from "bun:test"
import { Hono } from "hono"

test("HTTP query parsing returns scalar and repeated values before the URL fragment", async () => {
  const app = new Hono().get("/query", (c) =>
    c.json({ directory: c.req.query("directory"), tags: c.req.queries("tag") }),
  )
  const response = await app.request(
    "/query?directory=project-a&tag=first&tag=second#fragment&directory=project-b&tag=third",
  )

  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ directory: "project-a", tags: ["first", "second"] })
})
