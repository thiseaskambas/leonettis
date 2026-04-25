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

describe('/api/admin/translate route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('returns translations for a valid request', async () => {
    createCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              fr: 'Villa au bord de la mer',
              gr: 'Παραθαλάσσια βίλα',
              de: 'Villa am Meer',
              it: 'Villa sul mare',
            }),
          },
        },
      ],
    });

    const request = new Request('http://localhost/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Seaside villa',
        sourceLocale: 'en',
        field: 'title',
      }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.translations).toEqual({
      fr: 'Villa au bord de la mer',
      gr: 'Παραθαλάσσια βίλα',
      de: 'Villa am Meer',
      it: 'Villa sul mare',
    });
  });

  it('returns 400 when text is empty', async () => {
    const request = new Request('http://localhost/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '   ',
        sourceLocale: 'en',
        field: 'description',
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
    expect(createCompletion).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid source locale', async () => {
    const request = new Request('http://localhost/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Test',
        sourceLocale: 'es',
        field: 'title',
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
    expect(createCompletion).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid field', async () => {
    const request = new Request('http://localhost/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Test',
        sourceLocale: 'en',
        field: 'summary',
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
    expect(createCompletion).not.toHaveBeenCalled();
  });

  it('returns 502 when model response is malformed', async () => {
    createCompletion.mockResolvedValue({
      choices: [{ message: { content: '{"fr":"Bonjour"}' } }],
    });

    const request = new Request('http://localhost/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello',
        sourceLocale: 'en',
        field: 'description',
      }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(502);
  });
});
