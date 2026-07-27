import type { FastifyInstance, FastifyPluginAsync } from "fastify";

export const attachActorHook = (app: FastifyInstance) => {
  app.addHook("preHandler", async (request) => {
    const headers = request.headers || {};

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

    console.log(
      `🎭 [${request.method} ${request.url}] Actor: ${request.actor.name} (${request.actor.id})`,
    );
  });
};

export const actorMiddleware: FastifyPluginAsync = async (
  app: FastifyInstance,
) => {
  attachActorHook(app);
};
