# AI

The AI module provides reactive Google Generative AI operations using Angular signals.

## Quick Start

```typescript
import { provideFirebase } from '@ng-firebase-signals/core';
import { generateText, createChat } from '@ng-firebase-signals/core';

// In your app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebase({
      // your Firebase config
      googleAI: {
        apiKey: 'your-google-ai-key'
      }
    })
  ]
};

// In your component
export class AIComponent {
  async generateContent() {
    const response = await generateText('Write a short story about a robot.');
    console.log(response.text);
  }
}
```

## Functions

### Text Generation

#### `generateText(prompt: string, options?: TextGenerationOptions): Promise<AIResponse>`

Generates text using Google's Generative AI models.

**Parameters:**
- `prompt` - The text prompt to send to the AI
- `options` - Optional configuration for the generation

**Returns:** Promise with the AI response including text, usage statistics, and safety ratings

**Usage:**
```typescript
try {
  const response = await generateText('Explain quantum computing in simple terms', {
    model: 'gemini-pro',
    temperature: 0.3,
    maxOutputTokens: 1000
  });
  
  console.log('Generated text:', response.text);
  console.log('Tokens used:', response.usage.totalTokens);
} catch (error) {
  console.error('Generation failed:', error);
}
```

### Streaming Text Generation

#### `generateTextStream(prompt: string, options?: TextGenerationOptions): AsyncGenerator`

Generates text in real-time streaming format.

**Parameters:**
- `prompt` - The text prompt to send to the AI
- `options` - Optional configuration for the generation

**Returns:** Async generator that yields text chunks as they're generated

**Usage:**
```typescript
async function streamText() {
  try {
    const stream = generateTextStream('Write a poem about nature', {
      model: 'gemini-pro',
      temperature: 0.8
    });
    
    let fullText = '';
    for await (const chunk of stream) {
      if (!chunk.isComplete) {
        fullText += chunk.text;
        console.log('Current text:', fullText);
      }
    }
    
    console.log('Complete text:', fullText);
  } catch (error) {
    console.error('Streaming failed:', error);
  }
}
```

### Chat

#### `createChat(systemPrompt?: string, options?: ChatOptions)`

Creates a chat session with the AI model.

**Parameters:**
- `systemPrompt` - Optional system message to set the AI's behavior
- `options` - Optional configuration for the chat

**Returns:** Chat object with methods to send messages and manage conversation

**Usage:**
```typescript
const chat = createChat('You are a helpful coding assistant.', {
  model: 'gemini-pro',
  temperature: 0.2
});

// Send a message
try {
  const response = await chat.sendMessage('How do I implement a binary search?');
  console.log('AI response:', response.text);
} catch (error) {
  console.error('Chat failed:', error);
}

// Access conversation history
const messages = chat.messages();
console.log('Conversation:', messages);

// Clear history
chat.clearHistory();
```

### Batch Generation

#### `generateBatch(prompts: string[], options?: TextGenerationOptions): Promise<AIResponse[]>`

Generates text for multiple prompts in sequence.

**Parameters:**
- `prompts` - Array of text prompts
- `options` - Optional configuration for the generation

**Returns:** Promise with array of AI responses

**Usage:**
```typescript
const prompts = [
  'Write a haiku about spring',
  'Write a haiku about summer',
  'Write a haiku about autumn'
];

try {
  const responses = await generateBatch(prompts, {
    model: 'gemini-pro',
    temperature: 0.7
  });
  
  responses.forEach((response, index) => {
    console.log(`Haiku ${index + 1}:`, response.text);
  });
} catch (error) {
  console.error('Batch generation failed:', error);
}
```

## Types

### `AIResponse`
```typescript
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
```

### `TextGenerationOptions`
```typescript
export interface TextGenerationOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
  safetySettings?: SafetySetting[];
}
```

### `ChatMessage`
```typescript
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
```

### `ChatOptions`
```typescript
export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topK?: number;
  topP?: number;
  safetySettings?: SafetySetting[];
}
```

### `SupportedModels`
```typescript
export type SupportedModels = 
  | 'gemini-pro'
  | 'gemini-pro-vision'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'embedding-001';
```

## Usage Examples

### Simple Text Generation

```typescript
export class TextGeneratorComponent {
  generatedText = '';
  isGenerating = false;
  error = '';
  
  async generateText(prompt: string) {
    this.isGenerating = true;
    this.error = '';
    
    try {
      const response = await generateText(prompt, {
        model: 'gemini-pro',
        temperature: 0.7,
        maxOutputTokens: 500
      });
      
      this.generatedText = response.text;
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.isGenerating = false;
    }
  }
}
```

### Streaming Chat Interface

```typescript
export class StreamingChatComponent {
  userInput = '';
  messages: Array<{ role: string, content: string }> = [];
  isStreaming = false;
  
  async startStreaming() {
    if (!this.userInput.trim() || this.isStreaming) return;
    
    const userMessage = this.userInput.trim();
    this.messages.push({ role: 'User', content: userMessage });
    this.userInput = '';
    this.isStreaming = true;
    
    try {
      const stream = generateTextStream(userMessage, {
        model: 'gemini-pro',
        temperature: 0.8
      });
      
      let aiResponse = '';
      this.messages.push({ role: 'AI', content: aiResponse });
      
      for await (const chunk of stream) {
        if (!chunk.isComplete) {
          aiResponse += chunk.text;
          // Update the last message
          this.messages[this.messages.length - 1].content = aiResponse;
        }
      }
    } catch (error: any) {
      this.messages.push({ role: 'AI', content: `Error: ${error.message}` });
    } finally {
      this.isStreaming = false;
    }
  }
}
```

### AI Chat Assistant

```typescript
export class ChatAssistantComponent {
  chat = createChat('You are a helpful programming assistant. Provide clear, concise answers with code examples when appropriate.', {
    model: 'gemini-pro',
    temperature: 0.3
  });
  
  userInput = '';
  isSending = false;
  
  async sendMessage() {
    if (!this.userInput.trim() || this.isSending) return;
    
    this.isSending = true;
    
    try {
      const response = await this.chat.sendMessage(this.userInput);
      this.userInput = '';
      
      // The response is automatically added to the chat history
      console.log('AI response:', response.text);
    } catch (error: any) {
      console.error('Failed to send message:', error);
    } finally {
      this.isSending = false;
    }
  }
  
  clearChat() {
    this.chat.clearHistory();
  }
}
```

### Content Analysis

```typescript
export class ContentAnalyzerComponent {
  async analyzeContent(content: string) {
    try {
      const analysis = await generateText(`Analyze the following content and provide insights:\n\n${content}`, {
        model: 'gemini-pro',
        temperature: 0.2,
        maxOutputTokens: 1000
      });
      
      return analysis.text;
    } catch (error: any) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }
  
  async summarizeText(text: string, maxLength: number = 200) {
    try {
      const summary = await generateText(`Summarize the following text in ${maxLength} characters or less:\n\n${text}`, {
        model: 'gemini-pro',
        temperature: 0.1,
        maxOutputTokens: 500
      });
      
      return summary.text;
    } catch (error: any) {
      throw new Error(`Summarization failed: ${error.message}`);
    }
  }
}
```

## Best Practices

1. **Error Handling**: Always wrap AI operations in try-catch blocks
2. **Model Selection**: Choose appropriate models for your use case
3. **Temperature Control**: Use lower temperatures (0.1-0.3) for factual content, higher (0.7-0.9) for creative content
4. **Token Limits**: Set appropriate maxOutputTokens to control response length
5. **Safety Settings**: Use default safety settings unless you have specific requirements
6. **Streaming**: Use streaming for real-time user experiences
7. **Chat History**: Manage chat history appropriately for your application

## Security Considerations

- Never expose API keys in client-side code
- Implement proper rate limiting
- Validate and sanitize user inputs before sending to AI
- Use appropriate safety settings for your use case
- Monitor AI usage and costs
- Implement content filtering for user-generated content
