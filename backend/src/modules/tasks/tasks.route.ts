import type { FastifyInstance } from "fastify";
import {
  createTaskSchema,
  renameTaskColumnSchema,
  taskColumnCodeParamsSchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from "./tasks.schema";
import {
  createTask,
  deleteTask,
  listTasks,
  renameTaskColumnLabel,
  updateTask,
} from "./tasks.service";
import { actorMiddleware } from "../middleware/actor.middleware";
import { validate } from "../middleware/validate.middleware.ts";

export const registerTaskRoutes = async (app: FastifyInstance) => {
  app.get("/tasks", async () => {
    return listTasks();
  });

  app.put(
    "/task-columns/:code/label",
    {
      preHandler: validate({
        params: taskColumnCodeParamsSchema,
        body: renameTaskColumnSchema,
      }),
    },
    async (request, reply) => {
      const { code } = request.params;
      const { label } = request.body;

      const updatedColumn = await renameTaskColumnLabel(code, label);

      if (!updatedColumn) {
        return reply.code(404).send({ message: "Task column not found" });
      }

      return reply.code(200).send(updatedColumn);
    },
  );

  app.post(
    "/tasks",
    {
      preHandler: [actorMiddleware, validate({ body: createTaskSchema })],
    },
    async (request, reply) => {
      const createdTask = await createTask(request.body, request.actor);

      return reply.code(201).send(createdTask);
    },
  );

  app.put(
    "/tasks/:id",
    {
      preHandler: [
        actorMiddleware,
        validate({
          params: taskIdParamsSchema,
          body: updateTaskSchema,
        }),
      ],
    },
    async (request, reply) => {
      const updatedTask = await updateTask(
        request.params.id,
        request.body,
        request.actor,
      );

      if (!updatedTask) {
        return reply.code(404).send({ message: "Task not found" });
      }

      return reply.code(200).send(updatedTask);
    },
  );

  app.delete(
    "/tasks/:id",
    {
      preHandler: [actorMiddleware, validate({ params: taskIdParamsSchema })],
    },
    async (request, reply) => {
      const deletedCount = await deleteTask(request.params.id, request.actor);

      if (deletedCount === 0) {
        return reply.code(404).send({ message: "Task not found" });
      }

      return reply.code(204).send();
    },
  );
};
