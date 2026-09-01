import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { contactRouter } from "./routes/contact.js";
import { contentRouter } from "./routes/content.js";
import { projectsRouter } from "./routes/projects/index.js";

export function createApp() {
  const app = express();

  const clientOrigin = process.env.CLIENT_ORIGIN;

  app.use(
    cors({
      origin: clientOrigin || true,
    }),
  );
  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/content", contentRouter);
  app.use("/api/projects", projectsRouter);

  return app;
}
