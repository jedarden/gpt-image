import request from "supertest";
import app from "../server";
import path from "path";
import fs from "fs";

describe("Docker Static Serving Reliability", () => {
  it("serves static frontend assets at root", async () => {
    // Simulate a static file (index.html) in the build directory
    const staticDir = process.env.FRONTEND_BUILD_PATH || path.join(__dirname, "../../frontend/build");
    const indexPath = path.join(staticDir, "index.html");
    if (!fs.existsSync(indexPath)) {
      // Skip test if file doesn't exist in dev
      return;
    }
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/<html/i);
  });

  it("respects FRONTEND_BUILD_PATH environment variable", async () => {
    // Set env var to a dummy directory and check 404
    const original = process.env.FRONTEND_BUILD_PATH;
    process.env.FRONTEND_BUILD_PATH = path.join(__dirname, "not-a-real-dir");
    const res = await request(app).get("/");
    expect(res.status).toBe(404);
    process.env.FRONTEND_BUILD_PATH = original;
  });
});