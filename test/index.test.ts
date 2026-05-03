import { expect, test, describe, mock } from "bun:test";

// Mock itty-router
mock.module("itty-router", () => {
  return {
    Router: () => {
      const routes: any[] = [];
      const h = (method: string) => (path: string, ...handlers: any[]) => {
        routes.push({ method, path, handlers });
      };
      return {
        get: h("GET"),
        post: h("POST"),
        put: h("PUT"),
        delete: h("DELETE"),
        options: h("OPTIONS"),
        all: h("ALL"),
        fetch: async (req: Request, ...args: any[]) => {
          const url = new URL(req.url);
          for (const route of routes) {
            if ((route.method === "ALL" || route.method === req.method) &&
                (route.path === "*" || route.path === url.pathname)) {
              for (const handler of route.handlers) {
                const res = await handler(req, ...args);
                if (res) return res;
              }
            }
          }
        }
      };
    }
  };
});

const FETCH_URL = "http://localhost/api/contact";

describe("Contact Form API", () => {
  const env = { ASSETS: { fetch: () => new Response("OK") } };

  test("should return 200 for valid data", async () => {
    const worker = (await import("../src/index")).default;
    const request = new Request(FETCH_URL, {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        message: "Hello world"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await worker.fetch(request, env);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  test("should return 400 for missing name", async () => {
    const worker = (await import("../src/index")).default;
    const request = new Request(FETCH_URL, {
      method: "POST",
      body: JSON.stringify({
        email: "john@example.com",
        message: "Hello world"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await worker.fetch(request, env);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Missing required fields");
  });

  test("should return 400 for missing email", async () => {
    const worker = (await import("../src/index")).default;
    const request = new Request(FETCH_URL, {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        message: "Hello world"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await worker.fetch(request, env);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Missing required fields");
  });

  test("should return 400 for missing message", async () => {
    const worker = (await import("../src/index")).default;
    const request = new Request(FETCH_URL, {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com"
      }),
      headers: { "Content-Type": "application/json" }
    });

    const response = await worker.fetch(request, env);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Missing required fields");
  });

  test("should return 400 for invalid JSON", async () => {
    const worker = (await import("../src/index")).default;
    const request = new Request(FETCH_URL, {
      method: "POST",
      body: "{ invalid json }",
      headers: { "Content-Type": "application/json" }
    });

    const response = await worker.fetch(request, env);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid JSON in request body");
  });

  test("should return 400 for empty body", async () => {
    const worker = (await import("../src/index")).default;
    const request = new Request(FETCH_URL, {
      method: "POST",
      body: "",
      headers: { "Content-Type": "application/json" }
    });

    const response = await worker.fetch(request, env);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Empty request body");
  });
});
