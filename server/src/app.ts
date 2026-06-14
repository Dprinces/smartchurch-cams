import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";
import { apiRouter } from "./routes/index.js";

export const app = express();
const uploadsDirectory = path.join(process.cwd(), "uploads");

fs.mkdirSync(uploadsDirectory, { recursive: true });

app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "6mb" }));
app.use("/uploads", express.static(uploadsDirectory));

app.get("/", (_request, response) => {
  response.json({
    name: "SmartChurch CAMS API",
    version: "0.1.0",
    apiBase: "/api",
  });
});

app.use("/api", apiRouter);

app.use((request, response) => {
  response.status(404).json({
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof ZodError) {
      return response.status(400).json({
        message: "Validation failed",
        issues: error.flatten(),
      });
    }

    if (error instanceof Error) {
      return response.status(500).json({
        message: error.message,
      });
    }

    return response.status(500).json({
      message: "Internal server error",
    });
  },
);
