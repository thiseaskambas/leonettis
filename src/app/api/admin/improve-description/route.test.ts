import { beforeEach, describe, expect, it, vi } from 'vitest';

const createCompletion = vi.fn();

vi.mock('openai', () => ({
  default: class OpenAIMock {
    chat = {
      completions: {
        create: createCompletion,
      },
    };
  },
}));

import { POST } from './route';

describe('/api/admin/improve-description route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('returns improved description for a valid request', async () => {
    createCompletion.mockResolvedValue({
      choices: [{ message: { content: 'Polished listing description.' } }],
    });

    const request = new Request(
      'http://localhost/api/admin/improve-description',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'nice house, sea view, 3 bedrooms',
          locale: 'en',
        }),
      }
    );

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.improved).toBe('Polished listing description.');
  });

  it('returns 400 when text is empty', async () => {
    const request = new Request(
      'http://localhost/api/admin/improve-description',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '   ',
          locale: 'en',
        }),
      }
    );

    const response = await POST(request as never);
    expect(response.status).toBe(400);
    expect(createCompletion).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid locale', async () => {
    const request = new Request(
      'http://localhost/api/admin/improve-description',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Test',
          locale: 'es',
        }),
      }
    );

    const response = await POST(request as never);
    expect(response.status).toBe(400);
    expect(createCompletion).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON body', async () => {
    const request = new Request(
      'http://localhost/api/admin/improve-description',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid-json',
      }
    );

    const response = await POST(request as never);
    expect(response.status).toBe(400);
    expect(createCompletion).not.toHaveBeenCalled();
  });

  it('returns 502 when model response is empty', async () => {
    createCompletion.mockResolvedValue({
      choices: [{ message: { content: '   ' } }],
    });

    const request = new Request(
      'http://localhost/api/admin/improve-description',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'rough text',
          locale: 'en',
        }),
      }
    );

    const response = await POST(request as never);
    expect(response.status).toBe(502);
  });

  it('returns 500 when OpenAI provider fails', async () => {
    createCompletion.mockRejectedValue(new Error('provider down'));

    const request = new Request(
      'http://localhost/api/admin/improve-description',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'rough text',
          locale: 'en',
        }),
      }
    );

    const response = await POST(request as never);
    expect(response.status).toBe(500);
  });
});
