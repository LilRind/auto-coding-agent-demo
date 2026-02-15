import type { VolcImageResponse, VideoStyle } from '@/types/ai';
import { getStylePromptSuffix } from '@/types/ai';

const VOLC_IMAGE_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';
const VOLC_MODEL = 'doubao-seedream-4-5-251128';
const MAX_RETRIES = 3;
const TIMEOUT = 120000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function generateImage(
  prompt: string,
  style: VideoStyle = 'realistic',
  retries = MAX_RETRIES
): Promise<string> {
  const apiKey = process.env.VOLC_API_KEY;

  if (!apiKey) {
    throw new Error('VOLC_API_KEY is not configured');
  }

  const styleSuffix = getStylePromptSuffix(style);
  const fullPrompt = `${prompt}${styleSuffix}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        VOLC_IMAGE_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: VOLC_MODEL,
            prompt: fullPrompt,
            size: '2048x2048',
            response_format: 'b64_json',
          }),
        },
        TIMEOUT
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Volc Image API error: ${response.status} - ${errorText}`);
      }

      const data: VolcImageResponse = await response.json();
      const b64Json = data.data[0]?.b64_json;

      if (!b64Json) {
        throw new Error('No image data in response');
      }

      return b64Json;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries - 1) {
        await sleep(2000 * (attempt + 1));
      }
    }
  }

  throw lastError || new Error('Failed to generate image');
}

export async function generateImageBuffer(
  prompt: string,
  style: VideoStyle = 'realistic',
  retries = MAX_RETRIES
): Promise<Buffer> {
  const base64 = await generateImage(prompt, style, retries);
  return Buffer.from(base64, 'base64');
}

export async function regenerateImage(
  prompt: string,
  style: VideoStyle = 'realistic',
  retries = MAX_RETRIES
): Promise<string> {
  return generateImage(prompt, style, retries);
}
