import type { FastifyRequest, FastifyReply } from "fastify";

export async function actorMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const headers = request.headers as Record<string, unknown>;

  request.actor = {
    id:
      typeof headers["x-actor-id"] === "string"
        ? headers["x-actor-id"]
        : "unknown",
    name:
      typeof headers["x-actor-name"] === "string"
        ? headers["x-actor-name"]
        : "Unknown",
    color:
      typeof headers["x-actor-color"] === "string"
        ? headers["x-actor-color"]
        : "#9e9e9e",
  };
}
