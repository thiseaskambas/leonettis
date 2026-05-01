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

type TranslationField = 'title' | 'description';

interface TranslateRequestBody {
  text?: string;
  sourceLocale?: Locale;
  field?: TranslationField;
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

function isTranslationField(value: unknown): value is TranslationField {
  return value === 'title' || value === 'description';
}

function isLocale(value: unknown): value is Locale {
  return ALL_LOCALES.includes(value as Locale);
}

function parseTranslations(
  rawContent: string,
  targetLocales: Locale[]
): Record<Locale, string> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error('Model response is not valid JSON');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Model response must be a JSON object');
  }

  const translations = {} as Record<Locale, string>;

  for (const locale of targetLocales) {
    const value = (parsed as Record<string, unknown>)[locale];
    if (typeof value !== 'string') {
      throw new Error(`Missing translation for ${locale}`);
    }
    translations[locale] = value.trim();
  }

  return translations;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: TranslateRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const text = body.text?.trim() ?? '';
  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  if (!isLocale(body.sourceLocale)) {
    return NextResponse.json({ error: 'Invalid sourceLocale' }, { status: 400 });
  }

  if (!isTranslationField(body.field)) {
    return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
  }

  const sourceLocale = body.sourceLocale;
  const field = body.field;
  const targetLocales = ALL_LOCALES.filter((locale) => locale !== sourceLocale);
  const targetLanguages = targetLocales
    .map((locale) => LANGUAGE_BY_LOCALE[locale])
    .join(', ');
  const targetLocaleList = targetLocales.join(', ');
  const sourceLanguage = LANGUAGE_BY_LOCALE[sourceLocale];

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a professional real estate translator. Translate the provided text accurately and naturally, preserving a professional tone suitable for real estate listings. Return ONLY a valid JSON object.',
        },
        {
          role: 'user',
          content: `Translate this real estate listing ${field} from ${sourceLanguage} into the following languages: ${targetLanguages}. Return a JSON object with locale codes as keys (${targetLocaleList}) and the translated text as values.\n\nText to translate:\n"${text}"`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: 'Model returned empty response' },
        { status: 502 }
      );
    }

    const translations = parseTranslations(content, targetLocales);
    return NextResponse.json({ translations }, { status: 200 });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith('Model response') ||
        error.message.startsWith('Missing translation'))
    ) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
