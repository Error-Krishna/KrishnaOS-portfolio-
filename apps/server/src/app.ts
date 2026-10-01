import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { contactRouter } from "./routes/contact.js";
import { contentRouter } from "./routes/content.js";
import { projectsRouter } from "./routes/projects/index.js";

export function createApp() {
  const app = express();

  // The API runs behind a reverse proxy on the hosting platform; trusting one
  // hop makes `req.ip` the real visitor IP, which the rate limiter keys on.
  app.set("trust proxy", 1);

  const clientOrigin = process.env.CLIENT_ORIGIN;

  app.use(
    cors({
      origin: clientOrigin || true,
    }),
  );
  // Cap request bodies: the largest legitimate payload is a 5000-char contact
  // message, so anything near the default 100kb is not a real submission.
  app.use(express.json({ limit: "20kb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/content", contentRouter);
  app.use("/api/projects", projectsRouter);

  return app;
}
