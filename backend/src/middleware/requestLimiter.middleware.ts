import type { FastifyInstance, FastifyRequest } from "fastify";

type LimitEntry = {
  count: number;
  resetAt: number;
};

const requestLimits = new Map<string, LimitEntry>();

const limitedPaths = new Set(["/", "/tasks", "/task-columns"]);

const maxRequestsPerWindow = Number(process.env.REQUEST_LIMIT_MAX || 100);
const windowInMilliseconds = Number(
  process.env.REQUEST_LIMIT_WINDOW_MS || 60_000,
);

const isLimitedRequest = (request: FastifyRequest) => {
  if (request.method === "OPTIONS") {
    return false;
  }

  if (request.method === "GET" && request.url === "/health") {
    return false;
  }

  if (request.method === "GET" && request.url === "/events") {
    return false;
  }

  if (request.method === "GET" && request.url === "/debug-actor") {
    return false;
  }

  return Array.from(limitedPaths).some((path) => request.url.startsWith(path));
};

export const attachRequestLimiter = (app: FastifyInstance) => {
  app.addHook("onRequest", async (request, reply) => {
    if (!isLimitedRequest(request)) {
      return;
    }

    const forwardedFor = request.headers["x-forwarded-for"];
    const clientKey =
      request.ip ||
      (typeof forwardedFor === "string"
        ? forwardedFor
        : Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : undefined) ||
      "unknown";
    const now = Date.now();
    const currentLimit = requestLimits.get(clientKey);

    if (!currentLimit || currentLimit.resetAt <= now) {
      requestLimits.set(clientKey, {
        count: 1,
        resetAt: now + windowInMilliseconds,
      });

      return;
    }

    currentLimit.count += 1;

    if (currentLimit.count > maxRequestsPerWindow) {
      const retryAfterSeconds = Math.ceil((currentLimit.resetAt - now) / 1000);

      reply.header("Retry-After", String(retryAfterSeconds));
      return reply.code(429).send({
        message: "Too many requests",
        retryAfterSeconds,
      });
    }
  });
};