import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { Locale } from '@/i18n/routing';

const ALL_LOCALES: Locale[] = ['en', 'fr', 'gr', 'de', 'it'];
const LANGUAGE_BY_LOCALE: Record<Locale, string> = {
  en: 'English',
  fr: 'French',
  gr: 'Greek',
  de: 'German',
  it: 'Italian',
};

interface ImproveDescriptionRequestBody {
  text?: string;
  locale?: Locale;
}

let cachedClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }

  return cachedClient;
}

function isLocale(value: unknown): value is Locale {
  return ALL_LOCALES.includes(value as Locale);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: ImproveDescriptionRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const text = body.text?.trim() ?? '';
  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  if (!isLocale(body.locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
  }

  const locale = body.locale;
  const language = LANGUAGE_BY_LOCALE[locale];

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional real estate copywriter. Rewrite the provided listing description into a polished, engaging, and professional real estate description. Keep the same language as the input. Do not invent details that were not mentioned. Return only the improved description text with no explanation or formatting.',
        },
        {
          role: 'user',
          content: `Improve this ${language} real estate listing description:\n\n"${text}"`,
        },
      ],
    });

    const improved = completion.choices[0]?.message?.content?.trim();
    if (!improved) {
      return NextResponse.json(
        { error: 'Model returned empty response' },
        { status: 502 }
      );
    }

    return NextResponse.json({ improved }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Improvement failed' }, { status: 500 });
  }
}
