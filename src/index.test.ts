import { describe, it, expect, vi } from 'vitest';
import app from './index';

describe('API Endpoints', () => {
  describe('POST /api/contact', () => {
    const mockEnv = {
      ASSETS: {
        fetch: vi.fn()
      }
    };

    it('should return 400 for empty request body', async () => {
      const request = new Request('http://localhost/api/contact', {
        method: 'POST',
        body: '',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Empty request body' });
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should return 400 for invalid JSON in request body', async () => {
      const request = new Request('http://localhost/api/contact', {
        method: 'POST',
        body: '{"invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await app.fetch(request, mockEnv);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid JSON in request body' });
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
import worker from './index';

describe('Contact Endpoint', () => {
  it('should handle successful contact form submission', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is a test.'
      })
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should handle empty request body', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: ''
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Empty request body');
  });

  it('should handle invalid JSON body', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: '{ "invalid": json '
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid JSON in request body');
  });

  it('should handle missing required fields', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe'
      })
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing required fields: name, email, and message are required');
  });

  it('should handle unexpected errors during request processing', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: 'null'
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('An error occurred processing your request. Please try again later.');
  });

  it('should respond to OPTIONS preflight request', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'OPTIONS',
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('should proxy unknown routes to ASSETS', async () => {
    const request = new Request('http://localhost/unknown', {
      method: 'GET',
    });

    const env = {
      ASSETS: {
        fetch: vi.fn().mockResolvedValue(new Response('assets content', { status: 200 })),
      }
    };

    const response = await worker.fetch(request, env);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('assets content');
    expect(env.ASSETS.fetch).toHaveBeenCalledWith(request);
  });

  it('should hit outer catch block and handle error without message', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello'
      })
    });

    const originalStringify = JSON.stringify;
    JSON.stringify = vi.fn().mockImplementation((val) => {
      if (val && val.success === true) {
        throw 'Just a string error';
      }
      return originalStringify(val);
    });

    const response = await worker.fetch(request, {});
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('An error occurred processing your request. Please try again later.');
    expect(data.details).toBe('Unknown error');

    JSON.stringify = originalStringify;
  });
});
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
