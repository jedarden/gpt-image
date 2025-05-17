import request from "supertest";
import app from "../server"; // Adjust if app is exported differently

describe("Pipeline API", () => {
  it("processes mask field when present", async () => {
    const res = await request(app)
      .post("/api/pipeline")
      .send({
        prompt: "Test prompt",
        mask: "data:image/png;base64," + Buffer.from("dummy").toString("base64"),
      });
    expect(res.status).toBe(200);
    expect(res.body.metadata.maskUsed).toBe(true);
  });

  it("handles missing or empty mask field", async () => {
    const res = await request(app)
      .post("/api/pipeline")
      .send({ prompt: "Test prompt" });
    expect(res.status).toBe(200);
    expect(res.body.metadata.maskUsed).toBe(false);
  });

  it("rejects requests with invalid or malformed mask", async () => {
    const res = await request(app)
      .post("/api/pipeline")
      .send({ prompt: "Test prompt", mask: "not-a-base64-png" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid input");
  });

  it("returns consistent error for missing/invalid fields", async () => {
    const res = await request(app)
      .post("/api/pipeline")
      .send({ image: "data:image/png;base64,abc" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid input");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not found");
  });

  it("returns consistent error response for unhandled exceptions", async () => {
    // Simulate by sending a request that triggers an error (e.g., missing env keys)
    const original = process.env.GPT4_API_KEY;
    process.env.GPT4_API_KEY = "";
    const res = await request(app)
      .post("/api/pipeline")
      .send({ prompt: "Test prompt" });
    expect(res.status).toBe(500);
    process.env.GPT4_API_KEY = original;
  });
});