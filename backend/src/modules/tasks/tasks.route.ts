import type { FastifyInstance } from "fastify";
import {
  createTaskSchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from "./tasks.schema";
import { createTask, deleteTask, listTasks, updateTask } from "./tasks.service";

const getActorFromHeaders = (headers: Record<string, unknown>) => ({
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
});

export const registerTaskRoutes = async (app: FastifyInstance) => {
  app.get("/tasks", async () => {
    return listTasks();
  });

  app.post("/tasks", async (request, reply) => {
    const parsedBody = createTaskSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({
        message: "Invalid request body",
        issues: parsedBody.error.issues,
      });
    }

    const createdTask = await createTask(
      parsedBody.data,
      getActorFromHeaders(request.headers as Record<string, unknown>),
    );

    return reply.code(201).send(createdTask);
  });

  app.put("/tasks/:id", async (request, reply) => {
    const parsedParams = taskIdParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.code(400).send({
        message: "Invalid task id",
        issues: parsedParams.error.issues,
      });
    }

    const parsedBody = updateTaskSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({
        message: "Invalid request body",
        issues: parsedBody.error.issues,
      });
    }

    const updatedTask = await updateTask(
      parsedParams.data.id,
      parsedBody.data,
      getActorFromHeaders(request.headers as Record<string, unknown>),
    );

    if (!updatedTask) {
      return reply.code(404).send({ message: "Task not found" });
    }

    return reply.code(200).send(updatedTask);
  });

  app.delete("/tasks/:id", async (request, reply) => {
    const parsedParams = taskIdParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.code(400).send({
        message: "Invalid task id",
        issues: parsedParams.error.issues,
      });
    }

    const deletedCount = await deleteTask(
      parsedParams.data.id,
      getActorFromHeaders(request.headers as Record<string, unknown>),
    );

    if (deletedCount === 0) {
      return reply.code(404).send({ message: "Task not found" });
    }

    return reply.code(204).send();
  });
};
