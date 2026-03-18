export interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openrouter';
  maxTokens: number;
  supportsVision: boolean;
  isFree: boolean;
  pricing?: {
    input: number;
    output: number;
  };
}

export interface AIRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  images?: string[];
}

export interface AIResponse {
  content: string;
  model: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  provider: string;
}

export interface AIError {
  message: string;
  code: string;
  provider?: string;
  retryable: boolean;
}

export const GEMINI_MODELS: AIModel[] = [
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'gemini',
    maxTokens: 30720,
    supportsVision: false,
    isFree: false,
    pricing: { input: 0.000125, output: 0.0005 },
  },
  {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    provider: 'gemini',
    maxTokens: 12288,
    supportsVision: true,
    isFree: false,
    pricing: { input: 0.000125, output: 0.0005 },
  },
];

export const OPENROUTER_FREE_MODELS: AIModel[] = [
  {
    id: 'openrouter/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'openrouter',
    maxTokens: 4096,
    supportsVision: false,
    isFree: true,
    pricing: { input: 0, output: 0 },
  },
  {
    id: 'openrouter/mistral-7b-instruct',
    name: 'Mistral 7B Instruct',
    provider: 'openrouter',
    maxTokens: 8192,
    supportsVision: false,
    isFree: true,
    pricing: { input: 0, output: 0 },
  },
];

export const OPENROUTER_PREMIUM_MODELS: AIModel[] = [
  {
    id: 'openrouter/anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'openrouter',
    maxTokens: 4096,
    supportsVision: true,
    isFree: false,
    pricing: { input: 0.015, output: 0.075 },
  },
  {
    id: 'openrouter/anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'openrouter',
    maxTokens: 4096,
    supportsVision: true,
    isFree: false,
    pricing: { input: 0.003, output: 0.015 },
  },
  {
    id: 'openrouter/openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openrouter',
    maxTokens: 4096,
    supportsVision: true,
    isFree: false,
    pricing: { input: 0.01, output: 0.03 },
  },
  {
    id: 'openrouter/google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    provider: 'openrouter',
    maxTokens: 8192,
    supportsVision: true,
    isFree: false,
    pricing: { input: 0.00125, output: 0.005 },
  },
];

export const ALL_MODELS = [...GEMINI_MODELS, ...OPENROUTER_FREE_MODELS, ...OPENROUTER_PREMIUM_MODELS];

export function getModelsForPlan(plan: 'FREE' | 'PRO' | 'PREMIUM'): AIModel[] {
  switch (plan) {
    case 'FREE':
      return OPENROUTER_FREE_MODELS;
    case 'PRO':
      return [...GEMINI_MODELS, ...OPENROUTER_FREE_MODELS, ...OPENROUTER_PREMIUM_MODELS];
    case 'PREMIUM':
      return ALL_MODELS;
    default:
      return OPENROUTER_FREE_MODELS;
  }
}

export function getModelById(modelId: string): AIModel | undefined {
  return ALL_MODELS.find((m) => m.id === modelId);
}

export function isFreeModel(modelId: string): boolean {
  const model = getModelById(modelId);
  return model?.isFree ?? false;
}
