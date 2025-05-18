import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import pipelineRouter from "./routes/pipeline";
import generateImageRouter from "./routes/generateImage";
import rateLimit from "express-rate-limit";

dotenv.config();

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  // eslint-disable-next-line no-console
  console.error("ERROR: OPENAI_API_KEY environment variable is required but not set.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting for pipeline route
const pipelineLimiter = rateLimit({
 windowMs: 60 * 1000, // 1 minute
 max: 10, // limit each IP to 10 requests per minute
 message: { error: "Too many requests, please try again later." },
 standardHeaders: true,
 legacyHeaders: false,
 handler: (req, res, next, options) => {
   // Log excessive usage
   // eslint-disable-next-line no-console
   console.warn(`Rate limit exceeded for IP: ${req.ip}`);
   res.status(options.statusCode || 429).json(options.message);
 },
});
app.use("/api/pipeline", pipelineLimiter, pipelineRouter);

// Register the image generation route (handles /api/generate-image)
app.use("/", generateImageRouter);

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Serve frontend (for Docker/stateless deployment, to be configured)
import path from "path";
const staticDir = process.env.FRONTEND_BUILD_PATH
  ? path.resolve(process.env.FRONTEND_BUILD_PATH)
  : path.resolve(__dirname, "../../frontend/build");

/**
 * Static file path validation middleware.
 * Prevents directory traversal and serving files outside staticDir.
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  const requestedPath = req.path;
  // Only check for static asset requests (not API or SPA fallback)
  if (requestedPath.startsWith("/api/")) return next();
  // Compute the absolute path of the requested file
  const pathToCheck = path.resolve(staticDir, "." + requestedPath);
  if (!pathToCheck.startsWith(staticDir)) {
    // Attempted directory traversal or access outside staticDir
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

// Serve static files
app.use(express.static(staticDir));

// SPA catch-all: serve index.html for non-API, non-static routes
app.get("*", (req: Request, res: Response, next: NextFunction) => {
  // If the request is for an API route, skip
  if (req.path.startsWith("/api/")) return next();
  // If the request has a file extension, skip (likely a static asset)
  if (path.extname(req.path)) return next();
  res.sendFile(path.join(staticDir, "index.html"));
});

// 404 handler for unknown routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Not found" });
});

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Never leak sensitive info or API keys
  // Optionally log error details to server logs only
  // eslint-disable-next-line no-console
  console.error("Server error:", err);
  res.status(err.status || 500).json({ error: "Internal server error" });
});

// Export app for testing, only start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`GPT-Image-1 backend running on port ${PORT}`);
  });
}

export default app;