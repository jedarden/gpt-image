import request from "supertest";
import app from "../server";

describe("Rate Limiting", () => {
  it("rate limiting middleware restricts excessive requests", async () => {
    // Send 11 requests in quick succession (limit is 10/min)
    let lastRes;
    for (let i = 0; i < 11; i++) {
      lastRes = await request(app)
        .post("/api/pipeline")
        .send({ prompt: "Test prompt" });
    }
    expect(lastRes.status).toBe(429);
    expect(lastRes.body.error).toMatch(/too many requests/i);
  });

  it("rate-limited requests receive clear error response", async () => {
    // Exceed limit
    let res;
    for (let i = 0; i < 11; i++) {
      res = await request(app)
        .post("/api/pipeline")
        .send({ prompt: "Test prompt" });
    }
    expect(res.status).toBe(429);
    expect(res.body.error).toBeDefined();
  });

  it("rate limit resets after timeout", async () => {
    // Exceed limit
    for (let i = 0; i < 11; i++) {
      await request(app).post("/api/pipeline").send({ prompt: "Test prompt" });
    }
    // Wait for 61 seconds
    await new Promise((resolve) => setTimeout(resolve, 61000));
    // Should succeed again
    const res = await request(app)
      .post("/api/pipeline")
      .send({ prompt: "Test prompt" });
    expect(res.status).toBe(200);
  });
});