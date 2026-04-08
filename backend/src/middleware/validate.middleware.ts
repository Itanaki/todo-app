import type { FastifyRequest, FastifyReply } from "fastify";
import type { ZodSchema } from "zod";

export const validate =
  ({ body, params }: { body?: ZodSchema; params?: ZodSchema }) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    if (params) {
      const result = params.safeParse(request.params);
      if (!result.success) {
        return reply.code(400).send({
          message: "Invalid route parameters",
          issues: result.error.issues,
        });
      }
      request.params = result.data;
    }

    if (body) {
      const result = body.safeParse(request.body);
      if (!result.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          issues: result.error.issues,
        });
      }
      request.body = result.data;
    }
  };
