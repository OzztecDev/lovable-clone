import { AIRequest, AIResponse, AIError } from './models';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export class GeminiProvider {
  private apiKey: string;
  public model: string;

  constructor(model: string = 'gemini-pro') {
    this.apiKey = GEMINI_API_KEY || '';
    this.model = model;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const { prompt, maxTokens = 2048, temperature = 0.7, systemPrompt, images } = request;

    if (!this.apiKey) {
      throw {
        message: 'Gemini API key not configured',
        code: 'API_KEY_MISSING',
        provider: 'gemini',
        retryable: false,
      } as AIError;
    }

    try {
      const contents = this.buildContents(prompt, images);
      const systemInstruction = systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined;

      const response = await fetch(
        `${GEMINI_API_URL}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction,
            generationConfig: {
              maxOutputTokens: maxTokens,
              temperature,
              topP: 0.95,
              topK: 40,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.error?.message || 'Gemini API request failed',
          code: `HTTP_${response.status}`,
          provider: 'gemini',
          retryable: response.status >= 500,
        } as AIError;
      }

      const data = await response.json();
      
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const usage = data.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 };
      
      const inputTokens = usage.promptTokenCount || 0;
      const outputTokens = usage.candidatesTokenCount || 0;
      const totalTokens = inputTokens + outputTokens;
      
      const cost = this.calculateCost(inputTokens, outputTokens);

      return {
        content,
        model: this.model,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
        },
        cost,
        provider: 'gemini',
      };
    } catch (error) {
      if ((error as AIError).code) {
        throw error;
      }
      
      throw {
        message: error instanceof Error ? error.message : 'Unknown Gemini error',
        code: 'UNKNOWN_ERROR',
        provider: 'gemini',
        retryable: true,
      } as AIError;
    }
  }

  private buildContents(prompt: string, images?: string[]): any[] {
    if (images && images.length > 0) {
      const parts = [
        { text: prompt },
        ...images.map((imageData) => ({
          inlineData: {
            mimeType: this.detectMimeType(imageData),
            data: this.extractBase64(imageData),
          },
        })),
      ];
      return [{ parts }];
    }

    return [{ parts: [{ text: prompt }] }];
  }

  private detectMimeType(data: string): string {
    if (data.startsWith('/9j/')) return 'image/jpeg';
    if (data.startsWith('iVBOR')) return 'image/png';
    if (data.startsWith('UklGR')) return 'image/webp';
    return 'image/jpeg';
  }

  private extractBase64(data: string): string {
    if (data.includes(',')) {
      return data.split(',')[1];
    }
    return data;
  }

  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputPrice = 0.000125;
    const outputPrice = 0.0005;

    const inputCost = (inputTokens / 1000) * inputPrice;
    const outputCost = (outputTokens / 1000) * outputPrice;

    return inputCost + outputCost;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  getModel(): string {
    return this.model;
  }
}

export const geminiProvider = new GeminiProvider();
