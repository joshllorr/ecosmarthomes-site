import { describe, it, expect, vi } from 'vitest';
import app from './index';

describe('API Contact Endpoint', () => {
  const mockEnv = {
    ASSETS: {
      fetch: vi.fn()
    }
  };

  it('should handle OPTIONS preflight request with CORS headers', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'OPTIONS'
    });

    const response = await app.fetch(request, mockEnv);
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
  });

  it('should return 400 if request body is empty', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST'
    });

    const response = await app.fetch(request, mockEnv);
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

  it('should return 400 if request body contains invalid JSON', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: 'invalid-json',
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await app.fetch(request, mockEnv);
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

  it('should return 400 if required fields are missing', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }), // missing email and message
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await app.fetch(request, mockEnv);
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

  it('should return 200 success response when all required fields are provided', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Name',
        email: 'test@example.com',
        message: 'Hello, this is a test message!'
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await app.fetch(request, mockEnv);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Thank you! We received your enquiry and will get back to you within 24 hours.');
  });

  it('should return 500 error response when an unexpected error occurs', async () => {
    // Mock request.json() or properties to throw error from outside the JSON.parse try/catch
    // The try/catch for text() returns 400 for errors, so we need to mock something else
    // like the Request object itself lacking a property or throwing during a different phase.
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', message: 'test' }),
      headers: { 'Content-Type': 'application/json' }
    });

    // We can simulate an error by making request.text() resolve to valid JSON,
    // but throwing an error when accessing a property that is not guarded by the first try/catch block.
    // However, the first try/catch handles ALL errors from `request.text()`.
    // Wait, the first try/catch handles `request.text()` and `JSON.parse(text)`.
    // What if we throw an error in another way, or just mock the inner `catch` error logic?
    // Let's pass a mock Request that has text() return valid JSON, but we intercept something else.
    // The only other things are `data.name`, `data.email`, etc. If `data` is somehow a proxy that throws.

    const errorRequest = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' }
    });

    // Let's replace the fetch method on ASSETS to test route but this is contact form so ASSETS isn't hit.
    // The catch block at line 108 handles unexpected errors.
    // An unexpected error could be if `request.text` throws an error but it's caught by the INNER try/catch
    // Ah! In index.ts:
    // try { const text = await request.text(); ... } catch (parseError) { return 400 }
    // This inner try/catch completely catches `request.text()` errors.
    // So to trigger the OUTER catch block (line 108), the error must happen OUTSIDE the inner try/catch.
    // Outside the inner try/catch, there is only:
    // - `if (!data.name || !data.email || !data.message)`
    // - `console.log(...)`
    // - `return new Response(...)`

    // We can trigger an error by making `data` a proxy that throws on property access,
    // or by mocking `console.log` to throw!

    // Mock the second console.log to throw an error, since the first console.log
    // is inside the try/catch block that handles JSON parsing and returns 400.
    const originalConsoleLog = console.log;
    let callCount = 0;
    console.log = vi.fn().mockImplementation((msg, ...args) => {
      if (msg === 'Contact form submission:') {
        throw new Error('Unexpected error');
      }
      originalConsoleLog(msg, ...args);
    });

    const validRequest = new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Name',
        email: 'test@example.com',
        message: 'Hello, this is a test message!'
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    try {
      const response = await app.fetch(validRequest, mockEnv);
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('An error occurred processing your request. Please try again later.');
      expect(data.details).toBe('Unexpected error');
    } finally {
      console.log = originalConsoleLog; // Restore
    }
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
