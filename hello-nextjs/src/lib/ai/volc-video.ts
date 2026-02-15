import type { VolcVideoTaskResponse, VolcVideoTaskStatusResponse, VideoStyle } from '@/types/ai';
import { getStylePromptSuffix } from '@/types/ai';

const VOLC_VIDEO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks';
const VOLC_VIDEO_MODEL = 'doubao-seedance-1-5-pro-251215';
const MAX_RETRIES = 3;
const TIMEOUT = 60000;

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

export async function createVideoTask(
  imageUrl: string,
  prompt?: string,
  style: VideoStyle = 'realistic',
  retries = MAX_RETRIES
): Promise<string> {
  const apiKey = process.env.VOLC_API_KEY;

  if (!apiKey) {
    throw new Error('VOLC_API_KEY is not configured');
  }

  const styleSuffix = getStylePromptSuffix(style);
  const fullPrompt = prompt ? `${prompt}${styleSuffix}` : `generate video from image${styleSuffix}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        VOLC_VIDEO_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: VOLC_VIDEO_MODEL,
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
              {
                type: 'text',
                text: fullPrompt,
              },
            ],
          }),
        },
        TIMEOUT
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Volc Video API error: ${response.status} - ${errorText}`);
      }

      const data: VolcVideoTaskResponse = await response.json();

      if (!data.id) {
        throw new Error('No task ID in response');
      }

      return data.id;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries - 1) {
        await sleep(2000 * (attempt + 1));
      }
    }
  }

  throw lastError || new Error('Failed to create video task');
}

export async function getVideoTaskStatus(
  taskId: string,
  retries = MAX_RETRIES
): Promise<VolcVideoTaskStatusResponse> {
  const apiKey = process.env.VOLC_API_KEY;

  if (!apiKey) {
    throw new Error('VOLC_API_KEY is not configured');
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        `${VOLC_VIDEO_API_URL}/${taskId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
        TIMEOUT
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Volc Video API error: ${response.status} - ${errorText}`);
      }

      const data: VolcVideoTaskStatusResponse = await response.json();
      return data;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries - 1) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw lastError || new Error('Failed to get video task status');
}

export interface WaitForVideoOptions {
  pollInterval?: number;
  maxWaitTime?: number;
  onProgress?: (status: string) => void;
}

export async function waitForVideoTask(
  taskId: string,
  options: WaitForVideoOptions = {}
): Promise<string> {
  const { pollInterval = 5000, maxWaitTime = 600000, onProgress } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await getVideoTaskStatus(taskId);

    if (onProgress) {
      onProgress(status.status);
    }

    if (status.status === 'succeeded') {
      const videoUrl = status.output?.video_url;
      if (!videoUrl) {
        throw new Error('Video task succeeded but no video URL');
      }
      return videoUrl;
    }

    if (status.status === 'failed') {
      throw new Error(`Video task failed: ${status.error || 'Unknown error'}`);
    }

    await sleep(pollInterval);
  }

  throw new Error('Video task timed out');
}

export async function downloadVideo(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
