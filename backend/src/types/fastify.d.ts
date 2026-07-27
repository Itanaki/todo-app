import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    actor: {
      id: string;
      name: string;
      color: string;
    };
  }
}
