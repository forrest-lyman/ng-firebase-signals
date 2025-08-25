import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { runInInjectionContext } from '@angular/core';
import { 
  generateText, 
  generateTextStream, 
  createChat, 
  generateData,
  generateBatch,
  generateEmbeddings,
  Schema
} from './ai';
import { FIREBASE_APP } from './app';
import { 
  getAI, 
  getGenerativeModel, 
  VertexAIBackend 
} from 'firebase/ai';

// Mock Firebase AI
vi.mock('firebase/ai', () => ({
  getAI: vi.fn(),
  getGenerativeModel: vi.fn(),
  VertexAIBackend: vi.fn(),
  Schema: {
    object: vi.fn(),
    array: vi.fn(),
    string: vi.fn(),
    number: vi.fn(),
    boolean: vi.fn()
  }
}));

// Mock Firebase App
const mockFirebaseApp = {};

describe('AI Functions', () => {
  let injector: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FIREBASE_APP, useValue: mockFirebaseApp }
      ]
    });
    
    injector = TestBed.inject;
    vi.clearAllMocks();
  });

  // Helper function to run functions in injection context
  const runInContext = <T>(fn: () => T): T => {
    return runInInjectionContext(injector, fn);
  };

  describe('generateText', () => {
    it('should generate text successfully', async () => {
      const mockAI = {};
      const mockModel = {
        generateContent: vi.fn()
      };
      const mockResponse = {
        response: {
          text: () => 'Generated text response',
          usageMetadata: {
            promptTokenCount: 10,
            candidatesTokenCount: 50,
            totalTokenCount: 60
          },
          candidates: [{
            safetyRatings: [
              { category: 'HARM_CATEGORY_HARASSMENT', probability: 'LOW' }
            ]
          }]
        }
      };

      (getAI as any).mockReturnValue(mockAI);
      (getGenerativeModel as any).mockReturnValue(mockModel);
      (mockModel.generateContent as any).mockResolvedValue(mockResponse);

      const result = await runInContext(() => generateText('Test prompt'));

      expect(getAI).toHaveBeenCalledWith(mockFirebaseApp, { backend: expect.any(VertexAIBackend) });
      expect(getGenerativeModel).toHaveBeenCalledWith(mockAI, {
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topK: 40,
          topP: 0.95
        }
      });
      expect(mockModel.generateContent).toHaveBeenCalledWith('Test prompt');
      expect(result.text).toBe('Generated text response');
      expect(result.usage.totalTokens).toBe(60);
    });

    it('should handle generation error', async () => {
      const mockAI = {};
      const mockModel = {
        generateContent: vi.fn()
      };

      (getAI as any).mockReturnValue(mockAI);
      (getGenerativeModel as any).mockReturnValue(mockModel);
      (mockModel.generateContent as any).mockRejectedValue(new Error('Generation failed'));

      await expect(runInContext(() => generateText('Test prompt'))).rejects.toThrow('Text generation failed: Generation failed');
    });
  });

  describe('generateData', () => {
    it('should generate structured data successfully', async () => {
      const mockAI = {};
      const mockModel = {
        generateContent: vi.fn()
      };
      const mockSchema = Schema.object({
        properties: {
          users: Schema.array({
            items: Schema.object({
              properties: {
                name: Schema.string(),
                age: Schema.number()
              }
            })
          })
        }
      });
      const mockResponse = {
        response: {
          text: () => '{"users": [{"name": "John", "age": 30}]}',
          usageMetadata: {
            promptTokenCount: 15,
            candidatesTokenCount: 25,
            totalTokenCount: 40
          },
          candidates: [{
            safetyRatings: [
              { category: 'HARM_CATEGORY_HARASSMENT', probability: 'LOW' }
            ]
          }]
        }
      };

      (getAI as any).mockReturnValue(mockAI);
      (getGenerativeModel as any).mockReturnValue(mockModel);
      (mockModel.generateContent as any).mockResolvedValue(mockResponse);

      const result = await runInContext(() => generateData(mockSchema, 'Generate user data'));

      expect(getGenerativeModel).toHaveBeenCalledWith(mockAI, {
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
          topK: 40,
          topP: 0.95,
          responseMimeType: 'application/json',
          responseSchema: mockSchema
        }
      });
      expect(mockModel.generateContent).toHaveBeenCalledWith('Generate user data');
      expect(result.text).toBe('{"users": [{"name": "John", "age": 30}]}');
    });

    it('should handle data generation error', async () => {
      const mockAI = {};
      const mockModel = {
        generateContent: vi.fn()
      };
      const mockSchema = Schema.object({
        properties: {}
      });

      (getAI as any).mockReturnValue(mockAI);
      (getGenerativeModel as any).mockReturnValue(mockModel);
      (mockModel.generateContent as any).mockRejectedValue(new Error('Data generation failed'));

      await expect(runInContext(() => generateData(mockSchema, 'Generate data'))).rejects.toThrow('Data generation failed: Data generation failed');
    });
  });

  describe('generateTextStream', () => {
    it('should generate streaming text', async () => {
      const mockAI = {};
      const mockModel = {
        generateContentStream: vi.fn()
      };
      const mockStream = {
        stream: [
          { text: () => 'Hello' },
          { text: () => ' world' },
          { text: () => '!' }
        ]
      };

      (getAI as any).mockReturnValue(mockAI);
      (getGenerativeModel as any).mockReturnValue(mockModel);
      (mockModel.generateContentStream as any).mockResolvedValue(mockStream);

      const stream = runInContext(() => generateTextStream('Test prompt'));
      const chunks = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(mockModel.generateContentStream).toHaveBeenCalledWith('Test prompt');
      expect(chunks).toEqual([
        { text: 'Hello', isComplete: false },
        { text: ' world', isComplete: false },
        { text: '!', isComplete: false },
        { text: '', isComplete: true }
      ]);
    });

    it('should handle streaming error', async () => {
      const mockAI = {};
      const mockModel = {
        generateContentStream: vi.fn()
      };

      (getAI as any).mockReturnValue(mockAI);
      (getGenerativeModel as any).mockReturnValue(mockModel);
      (mockModel.generateContentStream as any).mockRejectedValue(new Error('Streaming failed'));

      const stream = runInContext(() => generateTextStream('Test prompt'));
      
      await expect(async () => {
        for await (const chunk of stream) {
          // This should throw
        }
      }).rejects.toThrow('Streaming text generation failed: Streaming failed');
    });
  });

  describe('createChat', () => {
    it('should create chat session', () => {
      const mockAI = {};
      const mockModel = {
        startChat: vi.fn()
      };
      const mockChat = {
        sendMessage: vi.fn()
      };

      (getAI as any).mockReturnValue(mockAI);
      (getGenerativeModel as any).mockReturnValue(mockModel);
      (mockModel.startChat as any).mockReturnValue(mockChat);

      const chat = runInContext(() => createChat('You are a helpful assistant'));

      expect(getGenerativeModel).toHaveBeenCalledWith(mockAI, {
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topK: 40,
          topP: 0.95
        }
      });
      expect(mockModel.startChat).toHaveBeenCalledWith({
        history: [{ role: 'model', parts: [{ text: 'You are a helpful assistant' }] }]
      });
      expect(chat.messages).toBeDefined();
      expect(chat.status).toBeDefined();
      expect(chat.error).toBeDefined();
      expect(chat.sendMessage).toBeDefined();
      expect(chat.clearHistory).toBeDefined();
    });

    it('should send message successfully', async () => {
      const mockAI = {};
      const mockModel = {
        startChat: vi.fn()
      };
      const mockChat = {
        sendMessage: vi.fn()
      };
      const mockResponse = {
        response: {
          text: () => 'Hello! How can I help you?',
          usageMetadata: {
            promptTokenCount: 5,
            candidatesTokenCount: 10,
            totalTokenCount: 15
          },
          candidates: [{
            safetyRatings: [
              { category: 'HARM_CATEGORY_HARASSMENT', probability: 'LOW' }
            ]
          }]
        }
      };

      (getAI as any).mockReturnValue(mockAI);
      (getGenerativeModel as any).mockReturnValue(mockModel);
      (mockModel.startChat as any).mockReturnValue(mockChat);
      (mockChat.sendMessage as any).mockResolvedValue(mockResponse);

      const chat = runInContext(() => createChat('You are a helpful assistant'));
      const result = await chat.sendMessage('Hello');

      expect(mockChat.sendMessage).toHaveBeenCalledWith('Hello');
      expect(result.text).toBe('Hello! How can I help you?');
    });
  });

  describe('generateBatch', () => {
    it('should generate batch responses', async () => {
      const mockAI = {};
      const mockModel = {
        generateContent: vi.fn()
      };
      const mockResponse1 = {
        response: {
          text: () => 'Response 1',
          usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 10, totalTokenCount: 15 },
          candidates: [{ safetyRatings: [] }]
        }
      };
      const mockResponse2 = {
        response: {
          text: () => 'Response 2',
          usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 10, totalTokenCount: 15 },
          candidates: [{ safetyRatings: [] }]
        }
      };

      (getAI as any).mockReturnValue(mockAI);
      (getGenerativeModel as any).mockReturnValue(mockModel);
      (mockModel.generateContent as any)
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const prompts = ['Prompt 1', 'Prompt 2'];
      const results = await runInContext(() => generateBatch(prompts));

      expect(mockModel.generateContent).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);
      expect(results[0].text).toBe('Response 1');
      expect(results[1].text).toBe('Response 2');
    });

    it('should handle batch generation errors gracefully', async () => {
      const mockAI = {};
      const mockModel = {
        generateContent: vi.fn()
      };

      (getAI as any).mockReturnValue(mockAI);
      (getGenerativeModel as any).mockReturnValue(mockModel);
      (mockModel.generateContent as any)
        .mockResolvedValueOnce({
          response: {
            text: () => 'Response 1',
            usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 10, totalTokenCount: 15 },
            candidates: [{ safetyRatings: [] }]
          }
        })
        .mockRejectedValueOnce(new Error('Generation failed'));

      const prompts = ['Prompt 1', 'Prompt 2'];
      const results = await runInContext(() => generateBatch(prompts));

      expect(results).toHaveLength(2);
      expect(results[0].text).toBe('Response 1');
      expect(results[1].text).toBe('');
    });
  });

  describe('generateEmbeddings', () => {
    it('should throw error for unsupported embeddings', async () => {
      await expect(runInContext(() => generateEmbeddings(['text1', 'text2']))).rejects.toThrow(
        'Embeddings are not yet supported in Firebase AI. Please use the text generation functions instead.'
      );
    });
  });

  describe('Schema', () => {
    it('should export Schema from firebase/ai', () => {
      expect(Schema).toBeDefined();
      expect(Schema.object).toBeDefined();
      expect(Schema.array).toBeDefined();
      expect(Schema.string).toBeDefined();
      expect(Schema.number).toBeDefined();
      expect(Schema.boolean).toBeDefined();
    });
  });
});
