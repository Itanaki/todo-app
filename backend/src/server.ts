import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerTaskRoutes } from "./modules/tasks/tasks.route";
import { subscribe, unsubscribe } from "./events/taskEvents";
const app = Fastify({ logger: true });

const start = async () => {
  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  app.get("/health", async () => ({ ok: true }));

  app.get("/events", (request, reply) => {
    const requestOrigin = request.headers.origin;

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": requestOrigin ?? "*",
      Vary: "Origin",
    });

    reply.raw.write(": connected\n\n");

    const send = (event: unknown) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const keepAliveTimer = setInterval(() => {
      reply.raw.write(": keepalive\n\n");
    }, 20000);

    subscribe(send);

    request.raw.on("close", () => {
      clearInterval(keepAliveTimer);
      unsubscribe(send);
    });
  });

  await registerTaskRoutes(app);

  const port = Number(process.env.PORT || 4000);
  await app.listen({ port, host: "0.0.0.0" });
};

start().catch((error) => {
  app.log.error(error);
  process.exit(1);
});
