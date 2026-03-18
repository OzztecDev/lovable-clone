export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeGenerationRequest {
  prompt: string;
  projectId?: string;
  framework?: string;
  styling?: string;
  model?: string;
}

export interface CodeGenerationResponse {
  success: boolean;
  code?: string;
  files?: Array<{
    name: string;
    path: string;
    content: string;
  }>;
  error?: string;
  model?: string;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
}
