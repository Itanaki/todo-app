import { test } from "node:test";
import assert from "node:assert";
import Fastify from "fastify";
import { taskInputMiddleware } from "../middleware/taskInput.middleware";

test("taskInputMiddleware trims title and description", async () => {
  const app = Fastify();

  app.post("/tasks", { preHandler: taskInputMiddleware }, async (request) => {
    return request.body;
  });

  const response = await app.inject({
    method: "POST",
    url: "/tasks",
    payload: {
      title: "  New task  ",
      description: "  Keep this tidy  ",
    },
  });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(JSON.parse(response.body), {
    title: "New task",
    description: "Keep this tidy",
  });
});
