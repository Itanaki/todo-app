import type { FastifyRequest, preHandlerHookHandler } from "fastify";

const normalizeTaskTextFields = (body: unknown) => {
  if (!body || typeof body !== "object") {
    return;
  }

  const payload = body as Record<string, unknown>;

  for (const field of ["title", "description"] as const) {
    const value = payload[field];

    if (typeof value === "string") {
      payload[field] = value.trim();
    }
  }
};

export const taskInputMiddleware: preHandlerHookHandler = async (
  request: FastifyRequest,
) => {
  normalizeTaskTextFields(request.body);
};
