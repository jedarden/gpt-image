import request from "supertest";
import app from "../server";

describe("Security and API Key Handling", () => {
  it("never includes API keys in any client response", async () => {
    const res = await request(app)
      .post("/api/pipeline")
      .send({ prompt: "Test prompt" });
    expect(JSON.stringify(res.body)).not.toMatch(/GPT4_API_KEY|IMAGE_API_KEY/i);
  });

  it("returns error if API key is missing from environment", async () => {
    const original = process.env.GPT4_API_KEY;
    process.env.GPT4_API_KEY = "";
    const res = await request(app)
      .post("/api/pipeline")
      .send({ prompt: "Test prompt" });
    expect(res.status).toBe(500);
    process.env.GPT4_API_KEY = original;
  });

  it("client cannot access API key via any endpoint", async () => {
    const res = await request(app).get("/api/health");
    expect(JSON.stringify(res.body)).not.toMatch(/GPT4_API_KEY|IMAGE_API_KEY/i);
  });
});