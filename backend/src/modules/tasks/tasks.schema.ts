import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in-progress", "complete"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  description: z.string().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dueDate must be YYYY-MM-DD")
    .optional(),
  status: taskStatusSchema.optional(),
});

export const taskIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  status: taskStatusSchema.optional(),
  orderedTaskIds: z.array(z.number().int().positive()).optional(),
  orderedByStatus: z
    .object({
      todo: z.array(z.number().int().positive()),
      "in-progress": z.array(z.number().int().positive()),
      complete: z.array(z.number().int().positive()),
    })
    .optional(),
});

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
