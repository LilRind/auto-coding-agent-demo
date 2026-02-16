export interface ZhipuChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ZhipuChatRequest {
  model: string;
  messages: ZhipuChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ZhipuChatResponse {
  id: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface SceneDescription {
  order_index: number;
  description: string;
}

export interface StoryToScenesResult {
  scenes: SceneDescription[];
}

export interface VolcImageRequest {
  model: string;
  prompt: string;
  size?: string;
  response_format?: string;
}

export interface VolcImageResponse {
  created: number;
  data: {
    url?: string;
    b64_json?: string;
  }[];
}

export interface VolcVideoRequest {
  model: string;
  prompt?: string;
  image_url: string;
  duration?: number;
}

export interface VolcVideoTaskResponse {
  id: string;
  status: string;
  model: string;
  created_at: number;
}

export interface VolcVideoTaskStatusResponse {
  id: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  model: string;
  created_at: number;
  content?: {
    video_url?: string;
  };
  error?: string;
}

export type VideoStyle =
  | 'realistic'
  | 'anime'
  | 'cartoon'
  | 'cinematic'
  | 'watercolor'
  | 'oil_painting'
  | 'sketch'
  | 'cyberpunk'
  | 'fantasy'
  | 'scifi';

export interface StyleOption {
  id: VideoStyle;
  name: string;
  description: string;
  prompt_suffix: string;
}

export const VIDEO_STYLES: StyleOption[] = [
  {
    id: 'realistic',
    name: '写实',
    description: '真实感强的风格',
    prompt_suffix: ', realistic, photorealistic, high detail',
  },
  {
    id: 'anime',
    name: '动漫',
    description: '日式动漫风格',
    prompt_suffix: ', anime style, vibrant colors, cel shading',
  },
  {
    id: 'cartoon',
    name: '卡通',
    description: '卡通动画风格',
    prompt_suffix: ', cartoon style, bold colors, simplified shapes',
  },
  {
    id: 'cinematic',
    name: '电影',
    description: '电影质感风格',
    prompt_suffix: ', cinematic lighting, dramatic composition, film grain',
  },
  {
    id: 'watercolor',
    name: '水彩',
    description: '水彩画风格',
    prompt_suffix: ', watercolor painting, soft colors, fluid brushstrokes',
  },
  {
    id: 'oil_painting',
    name: '油画',
    description: '油画艺术风格',
    prompt_suffix: ', oil painting, rich colors, textured brushwork',
  },
  {
    id: 'sketch',
    name: '素描',
    description: '铅笔素描风格',
    prompt_suffix: ', pencil sketch, graphite drawing, detailed linework',
  },
  {
    id: 'cyberpunk',
    name: '赛博朋克',
    description: '科幻赛博风格',
    prompt_suffix: ', cyberpunk style, neon lights, futuristic technology',
  },
  {
    id: 'fantasy',
    name: '奇幻',
    description: '奇幻魔法风格',
    prompt_suffix: ', fantasy art, magical atmosphere, ethereal lighting',
  },
  {
    id: 'scifi',
    name: '科幻',
    description: '未来科幻风格',
    prompt_suffix: ', sci-fi style, futuristic, high-tech elements',
  },
];

export function getStylePromptSuffix(style: VideoStyle): string {
  const found = VIDEO_STYLES.find((s) => s.id === style);
  return found ? found.prompt_suffix : VIDEO_STYLES[0].prompt_suffix;
}
