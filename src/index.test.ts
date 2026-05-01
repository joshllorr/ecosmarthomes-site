import { describe, it, expect, vi } from 'vitest';
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
