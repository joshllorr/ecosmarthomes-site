import { describe, it, expect, vi } from "vitest";
import worker from "./index";

describe("Contact Form API", () => {
  const mockEnv = {
    ASSETS: {
      fetch: vi.fn().mockResolvedValue(new Response("Asset Content", { status: 200 }))
    },
    RESEND_API_KEY: 'test_key',
    EMAIL_FROM: 'from@example.com',
    EMAIL_TO: 'to@example.com'
  };

  it("handles CORS preflight requests", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "OPTIONS",
    });
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should return 400 if request body is empty", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: "",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Empty request body");
  });

  it("should return 400 if request body contains invalid JSON", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: "{ invalid json }",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid request body format");
  });

  it("should return 400 if required fields are missing", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Missing required fields: name, email, and message are required");
  });

  it("handles valid contact form delivery", async () => {
    // Mock global fetch for Resend API call
    const globalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: '123' }), { status: 200 }));

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
    const response = await worker.fetch(request, mockEnv);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    
    global.fetch = globalFetch; // Restore
  });

  it("serves static assets", async () => {
      const request = new Request("http://localhost/some-asset.png");
      const response = await worker.fetch(request, mockEnv);

      expect(mockEnv.ASSETS.fetch).toHaveBeenCalledWith(request);
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("Asset Content");
  });
});