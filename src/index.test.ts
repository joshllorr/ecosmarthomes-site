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
  });
});
