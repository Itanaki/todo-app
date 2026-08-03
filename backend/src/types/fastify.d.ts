import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    actor: {
      id: string;
      name: string;
      color: string;
    };
    user: {
      id: string;
      email: string | null;
    } | null;
  }
}
