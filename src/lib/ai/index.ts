import { AIRequest, AIResponse, AIError, getModelsForPlan, isFreeModel } from './models';
import type { Plan } from '@/types/auth';
import { GeminiProvider, geminiProvider } from './gemini';
import { OpenRouterProvider, openRouterProvider } from './openrouter';

export interface AIEngineConfig {
  userPlan: Plan;
  preferredProvider?: 'gemini' | 'openrouter';
  fallbackEnabled?: boolean;
}

export class AIEngine {
  private gemini: GeminiProvider;
  private openRouter: OpenRouterProvider;
  private config: AIEngineConfig;

  constructor(config: AIEngineConfig) {
    this.gemini = geminiProvider;
    this.openRouter = openRouterProvider;
    this.config = {
      fallbackEnabled: true,
      ...config,
    };
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const { model: requestedModel } = request;

    const allowedModels = getModelsForPlan(this.config.userPlan);
    let modelToUse = requestedModel || this.getDefaultModel();

    if (requestedModel && !allowedModels.find((m) => m.id === requestedModel)) {
      modelToUse = this.getDefaultModel();
    }

    if (isFreeModel(modelToUse) && this.config.userPlan !== 'FREE') {
      modelToUse = 'gemini-pro';
    }

    const isGeminiModel = modelToUse.startsWith('gemini');
    const isOpenRouterModel = modelToUse.startsWith('openrouter');

    if (isGeminiModel) {
      return this.tryWithFallback(request, 'gemini', modelToUse);
    }

    if (isOpenRouterModel) {
      return this.tryWithFallback(request, 'openrouter', modelToUse);
    }

    return this.tryWithFallback(request, this.config.preferredProvider || 'openrouter', modelToUse);
  }

  private async tryWithFallback(
    request: AIRequest,
    primaryProvider: 'gemini' | 'openrouter',
    model: string
  ): Promise<AIResponse> {
    const providers: Array<{ name: 'gemini' | 'openrouter'; model: string }> = [
      { name: primaryProvider, model },
    ];

    if (this.config.fallbackEnabled) {
      const fallbackProvider = primaryProvider === 'gemini' ? 'openrouter' : 'gemini';
      const fallbackModel = this.getFallbackModel(fallbackProvider);
      if (fallbackModel) {
        providers.push({ name: fallbackProvider, model: fallbackModel });
      }
    }

    let lastError: AIError | null = null;

    for (const provider of providers) {
      try {
        if (provider.name === 'gemini') {
          this.gemini.model = model.includes('gemini') ? model : 'gemini-pro';
          return await this.gemini.generate(request);
        }

        if (provider.name === 'openrouter') {
          return await this.openRouter.generate({
            ...request,
            model: provider.model,
          });
        }
      } catch (error) {
        lastError = error as AIError;
        console.error(`Provider ${provider.name} failed:`, error);
        continue;
      }
    }

    throw lastError || {
      message: 'All AI providers failed',
      code: 'ALL_PROVIDERS_FAILED',
      retryable: true,
    };
  }

  private getDefaultModel(): string {
    if (this.config.userPlan === 'FREE') {
      return 'openrouter/claude-3-haiku';
    }

    if (this.config.userPlan === 'PRO' || this.config.userPlan === 'PREMIUM') {
      return 'gemini-pro';
    }

    return 'openrouter/claude-3-haiku';
  }

  private getFallbackModel(provider: 'gemini' | 'openrouter'): string | null {
    if (provider === 'gemini') {
      return 'gemini-pro';
    }

    if (provider === 'openrouter') {
      return 'openrouter/claude-3-haiku';
    }

    return null;
  }

  getAvailableModels() {
    return getModelsForPlan(this.config.userPlan);
  }
}

export function createAIEngine(userPlan: Plan): AIEngine {
  return new AIEngine({ userPlan });
}

export { type AIRequest, type AIResponse, type AIError };
