import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, true, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, true, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "You do not have permission to access this resource") {
    super(message, 403, true, "FORBIDDEN");
  }
}

export class ValidationError extends AppError {
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(message: string, details?: Array<{ field: string; message: string }>) {
    super(message, 400, true, "VALIDATION_ERROR");
    this.details = details;
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, true, "CONFLICT");
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    return res.status(400).json({
      error: "Validation Error",
      message: validationError.message,
      details: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err instanceof AppError) {
    const response: Record<string, any> = {
      error: err.code || "Error",
      message: err.message,
    };

    if (err instanceof ValidationError && err.details) {
      response.details = err.details;
    }

    if (Array.isArray(err?.errors)) {
      return res.status(400).json({
        message: err.message || 'Bad request',
        errors: err.errors,
      });
    }

    return res.status(err.statusCode).json(response);
  }

  console.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  if (process.env.NODE_ENV === "development") {
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred. Check server logs for details.",
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
  });
}
