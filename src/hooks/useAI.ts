import { useState, useCallback } from 'react';
import axios from 'axios';

interface UseAIOptions {
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export function useAI(options: UseAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<{ input: number; output: number; total: number } | null>(null);

  const generate = useCallback(async (prompt: string, projectId?: string, model?: string) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setTokens(null);

    try {
      const response = await axios.post('/api/ai/generate', {
        content: prompt,
        projectId,
        model,
      });

      const { content, tokens, model: usedModel } = response.data;
      
      setResponse(content);
      setTokens(tokens);
      options.onSuccess?.(response.data);

      return { success: true, content, tokens, model: usedModel };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Generation failed';
      setError(errorMessage);
      options.onError?.(err);

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
    setTokens(null);
  }, []);

  return {
    generate,
    isLoading,
    response,
    error,
    tokens,
    reset,
  };
}
