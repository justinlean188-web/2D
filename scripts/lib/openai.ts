import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * A very small OpenAI client built on fetch.
 *
 * The studio stays dependency-light: only the chat (vision), the image and the
 * speech endpoints are used, and every call fails with a readable message
 * instead of a stack trace.
 */

const API = 'https://api.openai.com/v1';

export const hasApiKey = (): boolean => Boolean(process.env.OPENAI_API_KEY);

export class OpenAiError extends Error {}

/** True when the failure is an authentication problem (so we stop retrying). */
export const isAuthError = (err: unknown): boolean =>
  err instanceof OpenAiError && /\b401\b|invalid_api_key|Incorrect API key/i.test(err.message);

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new OpenAiError(
      'OPENAI_API_KEY is not set. Copy .env.example to .env, add your key, and try again.'
    );
  }

  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new OpenAiError(`${res.status} ${res.statusText} — ${text.slice(0, 400)}`);
  }

  return (await res.json()) as T;
}

export interface ChatOptions {
  model?: string;
  system: string;
  user: string;
  images?: { path: string; dataUrl: string }[];
  schema?: Record<string, unknown>;
}

/** Runs a chat completion, optionally with images attached, and returns JSON. */
export async function chatJson<T>(options: ChatOptions): Promise<T> {
  const content: Record<string, unknown>[] = [{ type: 'text', text: options.user }];
  (options.images ?? []).forEach((img) => {
    content.push({ type: 'image_url', image_url: { url: img.dataUrl } });
  });

  const body: Record<string, unknown> = {
    model: options.model ?? 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: options.system },
      { role: 'user', content },
    ],
    temperature: 0.6,
  };

  if (options.schema) {
    body.response_format = {
      type: 'json_schema',
      json_schema: { name: 'reel', strict: true, schema: options.schema },
    };
  } else {
    body.response_format = { type: 'json_object' };
  }

  const data = await request<{
    choices: { message: { content: string | null } }[];
  }>('/chat/completions', body);

  const raw = data.choices?.[0]?.message?.content ?? '{}';
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new OpenAiError(`The model did not return JSON: ${raw.slice(0, 200)}`);
  }
}

export interface ImageOptions {
  prompt: string;
  size?: '1024x1024' | '1024x1536' | '1536x1024';
  transparent?: boolean;
}

/** Generates an image and returns the PNG bytes. */
export async function generateImage(options: ImageOptions): Promise<Buffer> {
  const body: Record<string, unknown> = {
    model: 'gpt-image-1',
    prompt: options.prompt,
    n: 1,
    size: options.size ?? '1024x1024',
  };
  if (options.transparent) {
    body.background = 'transparent';
    body.output_format = 'png';
  }

  const data = await request<{ data: { b64_json?: string }[] }>('/images/generations', body);
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new OpenAiError('The image model returned no image data.');
  return Buffer.from(b64, 'base64');
}

export interface SpeechOptions {
  text: string;
  voice: string;
  instructions: string;
  speed: number;
  format?: 'mp3' | 'wav';
}

/** Generates a speech clip and returns the audio bytes. */
export async function generateSpeech(options: SpeechOptions): Promise<Buffer> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new OpenAiError(
      'OPENAI_API_KEY is not set. Copy .env.example to .env, add your key, and try again.'
    );
  }

  const res = await fetch(`${API}/audio/speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice: options.voice,
      input: options.text,
      instructions: options.instructions,
      speed: options.speed,
      response_format: options.format ?? 'mp3',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new OpenAiError(`${res.status} ${res.statusText} — ${text.slice(0, 400)}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

/** Reads a file as a data URL so it can be attached to a vision request. */
export const toDataUrl = async (file: string): Promise<string> => {
  const ext = path.extname(file).slice(1).toLowerCase() || 'jpg';
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const buffer = await fs.readFile(file);
  return `data:${mime};base64,${buffer.toString('base64')}`;
};
