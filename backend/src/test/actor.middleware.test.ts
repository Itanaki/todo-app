import { test } from "node:test";
import assert from "node:assert";
import Fastify from "fastify";
import { actorMiddleware } from "../middleware/actor.middleware";

test("actorMiddleware should attach actor to request", async () => {
  const app = Fastify();
  await app.register(actorMiddleware);

  app.get("/test", async (request) => {
    return { actor: request.actor };
  });

  const response = await app.inject({
    method: "GET",
    url: "/test",
    headers: {
      "x-actor-id": "user123",
      "x-actor-name": "Alice",
      "x-actor-color": "#ff0000",
    },
  });

  const body = JSON.parse(response.body);
  assert.deepEqual(body.actor, {
    id: "user123",
    name: "Alice",
    color: "#ff0000",
  });
});

test("actorMiddleware should use defaults when headers missing", async () => {
  const app = Fastify();
  await app.register(actorMiddleware);

  app.get("/test", async (request) => {
    return { actor: request.actor };
  });

  const response = await app.inject({
    method: "GET",
    url: "/test",
  });

  const body = JSON.parse(response.body);
  assert.deepEqual(body.actor, {
    id: "unknown",
    name: "Unknown",
    color: "#9e9e9e",
  });
});
