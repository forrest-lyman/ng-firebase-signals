// fx/ai.ts
import { signal, inject, DestroyRef } from '@angular/core';
import {
  getAI,
  getGenerativeModel,
  VertexAIBackend,
  Schema
} from 'firebase/ai';
import { FIREBASE_APP } from './app';

export type AIStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AIResponse {
  text: string;
  usage: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  safetyRatings: Array<{
    category: string;
    probability: string;
  }>;
}

export interface TextGenerationOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
  safetySettings?: any[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
  safetySettings?: any[];
}

export interface EmbeddingOptions {
  model?: string;
}

export interface DataGenerationOptions extends TextGenerationOptions {
  count?: number;
  format?: 'json' | 'csv' | 'yaml';
  validateSchema?: boolean;
}

export type SupportedModels = 
  | 'gemini-pro'
  | 'gemini-pro-vision'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'gemini-2.5-flash'
  | 'embedding-001';

// Text generation function
export async function generateText(
  prompt: string,
  options: TextGenerationOptions = {}
): Promise<AIResponse> {
  const firebaseApp = inject(FIREBASE_APP);
  const ai = getAI(firebaseApp, { backend: new VertexAIBackend('global') });

  const model = getGenerativeModel(ai, {
    model: options.model || 'gemini-2.5-flash',
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 2048,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
    }
  });

  try {
    const result = await model.generateContent(prompt);
    return await processResponse(result);
  } catch (error: any) {
    throw new Error(`Text generation failed: ${error.message}`);
  }
}

// Data generation function
export async function generateData(
  schema: any,
  prompt: string,
  options: DataGenerationOptions = {}
): Promise<AIResponse> {
  const firebaseApp = inject(FIREBASE_APP);
  const ai = getAI(firebaseApp, { backend: new VertexAIBackend('global') });

  const model = getGenerativeModel(ai, {
    model: options.model || 'gemini-2.5-flash',
    generationConfig: {
      temperature: options.temperature || 0.3,
      maxOutputTokens: options.maxOutputTokens || 4096,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  });

  try {
    const result = await model.generateContent(prompt);
    return await processResponse(result);
  } catch (error: any) {
    throw new Error(`Data generation failed: ${error.message}`);
  }
}

// Streaming text generation function
export async function* generateTextStream(
  prompt: string,
  options: TextGenerationOptions = {}
): AsyncGenerator<{ text: string; isComplete: boolean }> {
  const firebaseApp = inject(FIREBASE_APP);
  const ai = getAI(firebaseApp, { backend: new VertexAIBackend('global') });

  const model = getGenerativeModel(ai, {
    model: options.model || 'gemini-2.5-flash',
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 2048,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
    }
  });

  try {
    const result = await model.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      yield { text, isComplete: false };
    }
    
    yield { text: '', isComplete: true };
  } catch (error: any) {
    throw new Error(`Streaming text generation failed: ${error.message}`);
  }
}

// Chat function
export function createChat(
  systemPrompt: string = 'You are a helpful assistant.',
  options: ChatOptions = {}
) {
  const messages = signal<ChatMessage[]>([
    { role: 'model', content: systemPrompt }
  ]);
  const status = signal<AIStatus>('idle');
  const error = signal<string | null>(null);

  const firebaseApp = inject(FIREBASE_APP);
  const ai = getAI(firebaseApp, { backend: new VertexAIBackend('global') });

  const model = getGenerativeModel(ai, {
    model: options.model || 'gemini-2.5-flash',
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 2048,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
    }
  });

  const chat = model.startChat({
    history: messages().map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }))
  });

  const sendMessage = async (userMessage: string): Promise<AIResponse> => {
    status.set('loading');
    error.set(null);

    try {
      // Add user message to history
      messages.update(prev => [...prev, { role: 'user', content: userMessage }]);

      // Get response from model
      const result = await chat.sendMessage(userMessage);
      const response = await processResponse(result);

      // Add model response to history
      messages.update(prev => [...prev, { role: 'model', content: response.text }]);

      status.set('success');
      return response;
    } catch (err: any) {
      status.set('error');
      error.set(err.message);
      throw err;
    }
  };

  const clearHistory = () => {
    messages.set([{ role: 'model', content: systemPrompt }]);
    status.set('idle');
    error.set(null);
  };

  return {
    messages,
    status,
    error,
    sendMessage,
    clearHistory
  };
}

// Embeddings function
export async function generateEmbeddings(
  texts: string[],
  options: EmbeddingOptions = {}
) {
  const firebaseApp = inject(FIREBASE_APP);
  const ai = getAI(firebaseApp, { backend: new VertexAIBackend('global') });

  // Note: Firebase AI doesn't have embeddings yet
  throw new Error('Embeddings are not yet supported in Firebase AI. Please use the text generation functions instead.');
}

// Batch text generation function
export async function generateBatch(
  prompts: string[],
  options: TextGenerationOptions & { model?: SupportedModels } = {}
) {
  const firebaseApp = inject(FIREBASE_APP);
  const ai = getAI(firebaseApp, { backend: new VertexAIBackend('global') });

  const model = getGenerativeModel(ai, {
    model: options.model || 'gemini-2.5-flash',
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxOutputTokens || 2048,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
    }
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
async function processResponse(result: any): Promise<AIResponse> {
  const response = await result.response;
  const text = response.text();
  
  const aiResponse: AIResponse = {
    text,
    usage: {
      promptTokens: response.usageMetadata?.promptTokenCount || 0,
      responseTokens: response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.usageMetadata?.totalTokenCount || 0,
    },
    safetyRatings: response.candidates?.[0]?.safetyRatings?.map((rating: any) => ({
      category: rating.category,
      probability: rating.probability
    })) || []
  };

  return aiResponse;
}

// Export Schema for convenience
export { Schema };
