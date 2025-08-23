// fx/ai.ts
import { signal, inject, DestroyRef } from '@angular/core';
import {
  getGenerativeModel,
  GenerativeModel,
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  SafetySetting,
  GenerateContentResult,
  GenerateContentStreamResult,
  EmbeddingModel,
  EmbeddingResult
} from '@google/generative-ai';
import { GOOGLE_AI } from './app';

export type AIStatus = 'idle' | 'loading' | 'success' | 'error' | 'streaming';

// Supported Google Generative AI Models
export type SupportedModels = 
  // Text generation models
  | 'gemini-1.0-pro'
  | 'gemini-1.0-pro-001'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'gemini-1.5-pro-latest'
  | 'gemini-1.5-flash-latest'
  | 'gemini-pro'
  | 'gemini-pro-vision'
  | 'gemini-1.0-pro-vision'
  | 'gemini-1.0-pro-vision-001'
  | 'gemini-1.5-pro-vision'
  | 'gemini-1.5-pro-vision-latest'
  // Embedding models
  | 'embedding-001'
  | 'text-embedding-004'
  | 'text-embedding-gecko-001'
  | 'text-embedding-gecko-002'
  | 'text-embedding-gecko-003'
  | 'text-embedding-gecko-multilingual-001'
  | 'text-embedding-gecko-multilingual-002'
  | 'text-embedding-gecko-multilingual-003'
  // Code generation models
  | 'codechat-bison'
  | 'codechat-bison-32k'
  | 'codechat-bison@001'
  | 'codechat-bison@002'
  | 'codechat-bison@latest'
  | 'codechat-bison-32k@001'
  | 'codechat-bison-32k@002'
  | 'codechat-bison-32k@latest'
  // Chat models
  | 'chat-bison'
  | 'chat-bison@001'
  | 'chat-bison@002'
  | 'chat-bison@latest'
  | 'chat-bison-32k'
  | 'chat-bison-32k@001'
  | 'chat-bison-32k@002'
  | 'chat-bison-32k@latest';

export interface TextGenerationOptions {
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
  safetySettings?: SafetySetting[];
}

export interface EmbeddingOptions {
  model?: SupportedModels;
  taskType?: string;
  title?: string;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
}

// Default safety settings
export const DEFAULT_SAFETY_SETTINGS: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Text generation function
export function generateText(
  prompt: string,
  options: TextGenerationOptions & { model?: SupportedModels } = {}
) {
  const data = signal<AIResponse | null>(null);
  const status = signal<AIStatus>('idle');
  const error = signal<string | null>(null);

  const destroyRef = inject(DestroyRef);
  const googleAI = inject(GOOGLE_AI, { optional: true });

  if (!googleAI) {
    error.set('Google AI not configured. Please provide googleAI.apiKey in your Firebase config.');
    return {
      data,
      status,
      error,
      generate: async () => {
        error.set('Google AI not configured');
      }
    };
  }

  const model = googleAI.getGenerativeModel({
    model: options.model || 'gemini-pro',
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 2048,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
    },
    safetySettings: options.safetySettings || DEFAULT_SAFETY_SETTINGS,
  });

  const generate = async () => {
    status.set('loading');
    error.set(null);

    try {
      const result = await model.generateContent(prompt);
      const response = await processResponse(result);
      data.set(response);
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return {
    data,
    status,
    error,
    generate
  };
}

// Streaming text generation function
export function generateTextStream(
  prompt: string,
  options: TextGenerationOptions & { model?: SupportedModels } = {}
) {
  const data = signal<AIResponse | null>(null);
  const status = signal<AIStatus>('idle');
  const error = signal<string | null>(null);
  const streamData = signal<string>('');

  const destroyRef = inject(DestroyRef);
  const googleAI = inject(GOOGLE_AI, { optional: true });

  if (!googleAI) {
    error.set('Google AI not configured. Please provide googleAI.apiKey in your Firebase config.');
    return {
      data,
      status,
      error,
      streamData,
      generate: async () => {
        error.set('Google AI not configured');
      }
    };
  }

  const model = googleAI.getGenerativeModel({
    model: options.model || 'gemini-pro',
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 2048,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
    },
    safetySettings: options.safetySettings || DEFAULT_SAFETY_SETTINGS,
  });

  const generate = async () => {
    status.set('loading');
    error.set(null);
    streamData.set('');

    try {
      status.set('streaming');
      
      const result = await model.generateContentStream(prompt);
      let fullText = '';

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        streamData.set(fullText);
      }

      const response = await processResponse(result);
      data.set(response);
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  return {
    data,
    status,
    error,
    streamData,
    generate
  };
}

// Chat message interface
export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp?: Date;
}

// Chat function
export function createChat(
  systemPrompt?: string,
  options: { model?: SupportedModels } = {}
) {
  const messages = signal<ChatMessage[]>([]);
  const status = signal<AIStatus>('idle');
  const error = signal<string | null>(null);

  const destroyRef = inject(DestroyRef);
  const googleAI = inject(GOOGLE_AI, { optional: true });

  if (!googleAI) {
    error.set('Google AI not configured. Please provide googleAI.apiKey in your Firebase config.');
    return {
      messages,
      status,
      error,
      sendMessage: async () => {
        error.set('Google AI not configured');
      },
      clearHistory: () => {},
      getConversation: () => []
    };
  }

  const model = googleAI.getGenerativeModel({
    model: options.model || 'gemini-pro',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      topK: 40,
      topP: 0.95,
    },
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  });

  // Initialize chat with system message if provided
  if (systemPrompt) {
    messages.set([{
      role: 'system',
      content: systemPrompt,
      timestamp: new Date()
    }]);
  }

  const sendMessage = async (content: string) => {
    status.set('loading');
    error.set(null);

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };
    messages.update(msgs => [...msgs, userMessage]);

    try {
      const result = await model.generateContent(content);
      const response = await processResponse(result);
      
      // Add model response
      const modelMessage: ChatMessage = {
        role: 'model',
        content: response.text,
        timestamp: new Date()
      };
      messages.update(msgs => [...msgs, modelMessage]);
      
      status.set('success');
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
    }
  };

  const clearHistory = () => {
    messages.set(systemPrompt ? [{
      role: 'system',
      content: systemPrompt,
      timestamp: new Date()
    }] : []);
  };

  const getConversation = () => {
    return messages();
  };

  return {
    messages,
    status,
    error,
    sendMessage,
    clearHistory,
    getConversation
  };
}

// Embeddings function
export async function generateEmbeddings(
  texts: string[],
  options: EmbeddingOptions = {}
) {
  const googleAI = inject(GOOGLE_AI, { optional: true });

  if (!googleAI) {
    throw new Error('Google AI not configured. Please provide googleAI.apiKey in your Firebase config.');
  }

  const embeddingModel = googleAI.getEmbeddingModel({
    model: (options.model as any) || 'embedding-001'
  });

  try {
    const result = await embeddingModel.embedContent(texts);
    return result.embedding;
  } catch (error: any) {
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

// Batch text generation function
export async function generateBatch(
  prompts: string[],
  options: TextGenerationOptions & { model?: SupportedModels } = {}
) {
  const googleAI = inject(GOOGLE_AI, { optional: true });

  if (!googleAI) {
    throw new Error('Google AI not configured. Please provide googleAI.apiKey in your Firebase config.');
  }

  const model = googleAI.getGenerativeModel({
    model: options.model || 'gemini-pro',
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 2048,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
    },
    safetySettings: options.safetySettings || DEFAULT_SAFETY_SETTINGS,
  });

  const results: AIResponse[] = [];
  
  for (const prompt of prompts) {
    try {
      const result = await model.generateContent(prompt);
      const response = await processResponse(result);
      results.push(response);
    } catch (error: any) {
      results.push({
        text: '',
        usage: { promptTokens: 0, responseTokens: 0, totalTokens: 0 },
        safetyRatings: []
      });
    }
  }
  
  return results;
}

// Process response and extract metadata
async function processResponse(result: GenerateContentResult | GenerateContentStreamResult): Promise<AIResponse> {
  const response = await result.response;
  const text = response.text();
  
  const aiResponse: AIResponse = {
    text,
    usage: {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      responseTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0,
    },
    safetyRatings: response.candidates?.[0]?.safetyRatings?.map(rating => ({
      category: rating.category,
      probability: rating.probability
    })) || []
  };

  return aiResponse;
}

// Utility functions for common AI tasks
export const AIUtils = {
  // Extract key information from text
  extractKeyInfo: (text: string) => {
    return `Please extract the key information from the following text and format it as a structured summary:\n\n${text}`;
  },

  // Summarize text
  summarizeText: (text: string, maxLength: number = 200) => {
    return `Please summarize the following text in ${maxLength} characters or less:\n\n${text}`;
  },

  // Translate text
  translateText: (text: string, targetLanguage: string) => {
    return `Please translate the following text to ${targetLanguage}:\n\n${text}`;
  },

  // Analyze sentiment
  analyzeSentiment: (text: string) => {
    return `Please analyze the sentiment of the following text and provide a brief explanation:\n\n${text}`;
  },

  // Generate creative content
  generateCreative: (prompt: string, style: string = 'creative') => {
    return `Please generate ${style} content based on the following prompt:\n\n${prompt}`;
  },

  // Code review
  reviewCode: (code: string, language: string) => {
    return `Please review the following ${language} code and provide suggestions for improvement:\n\n${code}`;
  }
};

// Pre-built prompts for common use cases
export const AIPrompts = {
  // Writing assistance
  writing: {
    brainstorm: (topic: string) => `Brainstorm ideas for: ${topic}`,
    outline: (topic: string) => `Create an outline for: ${topic}`,
    improve: (text: string) => `Improve this text: ${text}`,
    expand: (text: string) => `Expand on this idea: ${text}`,
  },

  // Analysis
  analysis: {
    compare: (item1: string, item2: string) => `Compare and contrast: ${item1} vs ${item2}`,
    prosCons: (topic: string) => `List pros and cons of: ${topic}`,
    explain: (concept: string) => `Explain this concept in simple terms: ${concept}`,
  },

  // Business
  business: {
    marketing: (product: string) => `Create marketing copy for: ${product}`,
    strategy: (business: string) => `Suggest strategies for: ${business}`,
    swot: (company: string) => `Perform SWOT analysis for: ${company}`,
  }
};
