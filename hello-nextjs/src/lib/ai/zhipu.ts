import type { ZhipuChatRequest, ZhipuChatResponse, SceneDescription, StoryToScenesResult } from '@/types/ai';

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const ZHIPU_MODEL = 'glm-4-flash';
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

export async function chatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  retries = MAX_RETRIES
): Promise<string> {
  const apiKey = process.env.ZHIPU_API_KEY;

  if (!apiKey) {
    throw new Error('ZHIPU_API_KEY is not configured');
  }

  const request: ZhipuChatRequest = {
    model: ZHIPU_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(
        ZHIPU_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(request),
        },
        TIMEOUT
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Zhipu API error: ${response.status} - ${errorText}`);
      }

      const data: ZhipuChatResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries - 1) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw lastError || new Error('Failed to call Zhipu API');
}

const STORY_TO_SCENES_PROMPT = `你是一个专业的视频脚本分镜师。请将用户输入的故事拆解成适合视频制作的分镜场景。

要求：
1. 每个场景应该是一个独立的视觉画面
2. 场景描述要具体、可视化，包含场景、人物、动作、情绪等要素
3. 场景数量根据故事长度和复杂度决定，通常在5-10个场景
4. 每个场景描述用中文，长度约50-100字

请直接返回JSON格式的分镜列表，格式如下：
{
  "scenes": [
    {"order_index": 1, "description": "场景1的详细描述..."},
    {"order_index": 2, "description": "场景2的详细描述..."},
    ...
  ]
}

注意：只返回JSON，不要包含任何其他文字。`;

export async function storyToScenes(
  story: string,
  style: string,
  retries = MAX_RETRIES
): Promise<SceneDescription[]> {
  const messages = [
    { role: 'system' as const, content: STORY_TO_SCENES_PROMPT },
    {
      role: 'user' as const,
      content: `故事内容：\n${story}\n\n视频风格：${style}\n\n请将这个故事拆解成分镜场景。`,
    },
  ];

  const content = await chatCompletion(messages, retries);

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result: StoryToScenesResult = JSON.parse(jsonMatch[0]);

    if (!result.scenes || !Array.isArray(result.scenes)) {
      throw new Error('Invalid response format: missing scenes array');
    }

    return result.scenes.map((scene, index) => ({
      order_index: scene.order_index ?? index + 1,
      description: scene.description,
    }));
  } catch (error) {
    throw new Error(`Failed to parse scenes from AI response: ${error}`);
  }
}

export async function regenerateScenes(
  story: string,
  style: string,
  feedback?: string,
  retries = MAX_RETRIES
): Promise<SceneDescription[]> {
  let userContent = `故事内容：\n${story}\n\n视频风格：${style}`;

  if (feedback) {
    userContent += `\n\n用户反馈：${feedback}\n请根据反馈调整分镜。`;
  }

  const messages = [
    { role: 'system' as const, content: STORY_TO_SCENES_PROMPT },
    { role: 'user' as const, content: userContent },
  ];

  const content = await chatCompletion(messages, retries);

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result: StoryToScenesResult = JSON.parse(jsonMatch[0]);

    if (!result.scenes || !Array.isArray(result.scenes)) {
      throw new Error('Invalid response format: missing scenes array');
    }

    return result.scenes.map((scene, index) => ({
      order_index: scene.order_index ?? index + 1,
      description: scene.description,
    }));
  } catch (error) {
    throw new Error(`Failed to parse scenes from AI response: ${error}`);
  }
}
