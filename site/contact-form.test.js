import { fireEvent, waitFor } from '@testing-library/dom';
import fs from 'fs';
import { jest } from '@jest/globals';

describe('Contact Form', () => {
  beforeAll(() => {
    document.body.innerHTML = `
      <form id="contactForm">
        <input name="name" id="name" />
        <input name="email" id="email" />
        <textarea name="message" id="message"></textarea>
        <button type="submit">Submit</button>
      </form>
      <div id="formMessage"></div>
    `;

    const scriptCode = fs.readFileSync('site/contact-form.js', 'utf8');
    eval(scriptCode);

    const event = document.createEvent('Event');
    event.initEvent('DOMContentLoaded', true, true);
    window.document.dispatchEvent(event);
  });

  beforeEach(() => {
    // Reset inputs and messages
    document.getElementById('contactForm').reset();
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('message').value = '';
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = '';
    formMessage.className = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show error if fields are missing', () => {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    fireEvent.submit(form);

    expect(formMessage.textContent).toBe('Please fill in all required fields');
    expect(formMessage.className).toContain('error');
  });

  it('should send a POST request with correct data when form is valid', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
      })
    );

    const form = document.getElementById('contactForm');
    document.getElementById('name').value = 'John Doe';
    document.getElementById('email').value = 'john@example.com';
    document.getElementById('message').value = 'Hello World';
    const formMessage = document.getElementById('formMessage');

    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData)
    }));

    const formData = global.fetch.mock.calls[0][1].body;
    expect(formData.get('name')).toBe('John Doe');
    expect(formData.get('email')).toBe('john@example.com');
    expect(formData.get('message')).toBe('Hello World');

    await waitFor(() => {
      expect(formMessage.textContent).toBe('Thank you! We’ll be in touch within 24 hours.');
      expect(formMessage.className).toContain('success');
    });
  });

  it('should show error message if the server responds with an error', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('Custom error from server'),
      })
    );

    const form = document.getElementById('contactForm');
    document.getElementById('name').value = 'John Doe';
    document.getElementById('email').value = 'john@example.com';
    document.getElementById('message').value = 'Hello World';
    const formMessage = document.getElementById('formMessage');

    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(formMessage.textContent).toBe('Custom error from server');
    });

    expect(formMessage.className).toContain('error');
  });

  it('should show a default error message if fetch throws an exception', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
    console.error = jest.fn(); // suppress console error output during testing

    const form = document.getElementById('contactForm');
    document.getElementById('name').value = 'John Doe';
    document.getElementById('email').value = 'john@example.com';
    document.getElementById('message').value = 'Hello World';
    const formMessage = document.getElementById('formMessage');

    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(formMessage.textContent).toBe('An error occurred. Please try again later.');
    });

    expect(formMessage.className).toContain('error');
    expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
  });
});
