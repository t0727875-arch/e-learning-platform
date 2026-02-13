import type { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodSchema } from "zod";
import { fromZodError } from "zod-validation-error";

/*export function validate<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          error: "Validation Error",
          message: validationError.message,
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Validation middleware error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to validate request",
      });
    }
  };
}*/

export const validate = (schema?: ZodSchema) => {
  return (req, res, next) => {
    try {
      if (!schema) {
        return res.status(500).json({
          message: 'Validation schema is missing for this route',
        });
      }

      schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
};

export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          error: "Validation Error",
          message: validationError.message,
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Query validation error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to validate query parameters",
      });
    }
  };
}

export function validateParams<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          error: "Validation Error",
          message: validationError.message,
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Params validation error:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to validate URL parameters",
      });
    }
  };
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
