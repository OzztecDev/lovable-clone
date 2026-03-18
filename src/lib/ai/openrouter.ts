import { AIRequest, AIResponse, AIError } from './models';

const OPENROUTER_API_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export class OpenRouterProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = OPENROUTER_API_KEY || '';
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const { prompt, model = 'openrouter/claude-3-haiku', maxTokens = 4096, temperature = 0.7, systemPrompt } = request;

    if (!this.apiKey) {
      throw {
        message: 'OpenRouter API key not configured',
        code: 'API_KEY_MISSING',
        provider: 'openrouter',
        retryable: false,
      } as AIError;
    }

    try {
      const messages = this.buildMessages(prompt, systemPrompt);

      const response = await fetch(`${OPENROUTER_API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Lovable Clone',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          top_p: 0.95,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.error?.message || 'OpenRouter API request failed',
          code: `HTTP_${response.status}`,
          provider: 'openrouter',
          retryable: response.status >= 500,
        } as AIError;
      }

      const data = await response.json();
      
      const content = data.choices?.[0]?.message?.content || '';
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0 };
      
      const inputTokens = usage.prompt_tokens || 0;
      const outputTokens = usage.completion_tokens || 0;
      const totalTokens = inputTokens + outputTokens;
      
      const cost = data.usage?.total_cost || this.estimateCost(model, totalTokens);

      return {
        content,
        model,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
        },
        cost,
        provider: 'openrouter',
      };
    } catch (error) {
      if ((error as AIError).code) {
        throw error;
      }
      
      throw {
        message: error instanceof Error ? error.message : 'Unknown OpenRouter error',
        code: 'UNKNOWN_ERROR',
        provider: 'openrouter',
        retryable: true,
      } as AIError;
    }
  }

  private buildMessages(prompt: string, systemPrompt?: string): any[] {
    const messages = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    return messages;
  }

  private estimateCost(model: string, tokens: number): number {
    const costs: Record<string, number> = {
      'openrouter/claude-3-haiku': 0.00000025,
      'openrouter/mistral-7b-instruct': 0.0000001,
      'openrouter/anthropic/claude-3-opus': 0.000015,
      'openrouter/anthropic/claude-3-sonnet': 0.000003,
      'openrouter/openai/gpt-4-turbo': 0.00001,
    };

    const costPerToken = costs[model] || 0.000001;
    return tokens * costPerToken;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

export const openRouterProvider = new OpenRouterProvider();
