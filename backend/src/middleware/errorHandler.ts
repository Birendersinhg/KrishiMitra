import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  console.error("Server Error:", err);

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "We encountered an issue processing your request. Please try again."
      : err.message || "Something went wrong.";

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
