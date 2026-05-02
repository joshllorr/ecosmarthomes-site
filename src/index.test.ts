import { describe, it, expect, vi } from "vitest";
import worker from "./index";

describe("Cloudflare Worker", () => {
  it("handles CORS preflight requests", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "OPTIONS",
    });
    const response = await worker.fetch(request, {});

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("handles contact form submission with empty body", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: "",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const response = await worker.fetch(request, {});

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Empty request body");
  });

  it("handles contact form submission with invalid json", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: "{ invalid json }",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const response = await worker.fetch(request, {});

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid JSON in request body");
  });

  it("handles contact form submission with missing fields", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const response = await worker.fetch(request, {});

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Missing required fields: name, email, and message are required");
  });

  it("handles valid contact form submission", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        message: "This is a test message."
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const response = await worker.fetch(request, {});

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("serves static assets", async () => {
      const mockEnv = {
          ASSETS: {
              fetch: vi.fn().mockResolvedValue(new Response("Asset Content", { status: 200 }))
          }
      };

      const request = new Request("http://localhost/some-asset.png");
      const response = await worker.fetch(request, mockEnv);

      expect(mockEnv.ASSETS.fetch).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("Asset Content");
  });
});
