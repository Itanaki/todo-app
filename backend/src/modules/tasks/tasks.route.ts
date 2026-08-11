import type { FastifyInstance } from "fastify";
import {
  createTaskSchema,
  renameTaskColumnSchema,
  taskColumnCodeParamsSchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from "./tasks.schema";
import { taskInputMiddleware } from "../../middleware/taskInput.middleware";
import {
  createTask,
  deleteTask,
  listTasks,
  renameTaskColumnLabel,
  updateTask,
} from "./tasks.service";

export const registerTaskRoutes = async (app: FastifyInstance) => {
  app.get("/tasks", async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    return listTasks(request.user.id);
  });

  app.put("/task-columns/:code/label", async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ message: "Unauthorized" });
    }
    const parsedParams = taskColumnCodeParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.code(400).send({
        message: "Invalid task column code",
        issues: parsedParams.error.issues,
      });
    }

    const parsedBody = renameTaskColumnSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({
        message: "Invalid request body",
        issues: parsedBody.error.issues,
      });
    }

    const updatedColumn = await renameTaskColumnLabel(
      parsedParams.data.code,
      parsedBody.data.label,
      request.user.id,
    );

    if (!updatedColumn) {
      return reply.code(404).send({ message: "Task column not found" });
    }

    return reply.code(200).send(updatedColumn);
  });

  app.post(
    "/tasks",
    { preHandler: taskInputMiddleware },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const parsedBody = createTaskSchema.safeParse(request.body);
      if (!parsedBody.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          issues: parsedBody.error.issues,
        });
      }

      try {
        const createdTask = await createTask(
          parsedBody.data,
          request.actor,
          request.user.id,
        );

        return reply.code(201).send(createdTask);
      } catch (error) {
        return reply.code(400).send({
          message:
            error instanceof Error ? error.message : "Failed to create task",
        });
      }
    },
  );

  app.put(
    "/tasks/:id",
    { preHandler: taskInputMiddleware },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

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

      let updatedTask;

      try {
        updatedTask = await updateTask(
          parsedParams.data.id,
          parsedBody.data,
          request.actor,
          request.user.id,
        );
      } catch (error) {
        return reply.code(400).send({
          message:
            error instanceof Error ? error.message : "Failed to update task",
        });
      }

      if (!updatedTask) {
        return reply.code(404).send({ message: "Task not found" });
      }

      return reply.code(200).send(updatedTask);
    },
  );

  app.delete("/tasks/:id", async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const parsedParams = taskIdParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.code(400).send({
        message: "Invalid task id",
        issues: parsedParams.error.issues,
      });
    }

    const deletedCount = await deleteTask(
      parsedParams.data.id,
      request.actor,
      request.user.id,
    );

    if (deletedCount === 0) {
      return reply.code(404).send({ message: "Task not found" });
    }

    return reply.code(204).send();
  });
};
