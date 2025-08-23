# AI

The AI module provides Google Generative AI integration with reactive text generation, chat functionality, and embeddings using Angular signals.

## Overview

Each AI function is focused and does one specific thing, returning reactive signals for AI operations. This approach provides clean separation of concerns and better composability.

## Prerequisites

To use the AI module, you need to configure Google AI in your Firebase configuration:

```typescript
// app.config.ts
import { provideFirebase } from 'ng-firebase-signals';

const firebaseConfig = {
  // ... other Firebase config
  googleAI: {
    apiKey: 'your-google-ai-api-key',
    defaultModel: 'gemini-pro' // optional
  }
};

export const appConfig = {
  providers: [
    provideFirebase(firebaseConfig)
  ]
};
```

## Core Functions

### Text Generation

#### `generateText(prompt: string, options?: TextGenerationOptions & { model?: SupportedModels })`

Creates a reactive text generation operation.

```typescript
import { generateText } from 'ng-firebase-signals';

@Component({...})
export class TextGenerationComponent {
  textGenerator = generateText('Write a short story about friendship');
  
  // Access reactive state
  data = this.textGenerator.data;
  status = this.textGenerator.status;
  error = this.textGenerator.error;
}
```

**Parameters:**
- `prompt` - The text prompt to send to the AI model
- `options` - Optional configuration including model, temperature, and safety settings

**Returns:**
- `data` - Signal containing the generated text response
- `status` - Signal with current operation status
- `error` - Signal containing any errors
- `generate()` - Function to trigger text generation

**Template Usage:**
```html
<div class="text-generation">
  <button 
    (click)="textGenerator.generate()"
    [disabled]="textGenerator.status() === 'loading'">
    {{ textGenerator.status() === 'loading' ? 'Generating...' : 'Generate Text' }}
  </button>
  
  <div *ngIf="textGenerator.data()" class="generated-text">
    <h3>Generated Text:</h3>
    <p>{{ textGenerator.data()?.text }}</p>
    
    <div *ngIf="textGenerator.data()?.usage" class="usage-info">
      <p>Tokens used: {{ textGenerator.data()?.usage.totalTokens }}</p>
    </div>
  </div>
  
  <div *ngIf="textGenerator.error()" class="error">
    Error: {{ textGenerator.error() }}
  </div>
</div>
```

#### `generateTextStream(prompt: string, options?: TextGenerationOptions & { model?: SupportedModels })`

Creates a reactive streaming text generation operation.

```typescript
import { generateTextStream } from 'ng-firebase-signals';

@Component({...})
export class StreamingTextComponent {
  streamingGenerator = generateTextStream('Write a long story about adventure');
  
  // Access reactive state
  data = this.streamingGenerator.data;
  status = this.streamingGenerator.status;
  error = this.streamingGenerator.error;
  streamData = this.streamingGenerator.streamData;
}
```

**Parameters:**
- `prompt` - The text prompt to send to the AI model
- `options` - Optional configuration including model, temperature, and safety settings

**Returns:**
- `data` - Signal containing the final generated text response
- `status` - Signal with current operation status
- `error` - Signal containing any errors
- `streamData` - Signal containing the streaming text as it's generated
- `generate()` - Function to trigger streaming text generation

**Template Usage:**
```html
<div class="streaming-generation">
  <button 
    (click)="streamingGenerator.generate()"
    [disabled]="streamingGenerator.status() === 'loading' || streamingGenerator.status() === 'streaming'">
    {{ streamingGenerator.status() === 'loading' ? 'Starting...' : 
       streamingGenerator.status() === 'streaming' ? 'Streaming...' : 'Start Streaming' }}
  </button>
  
  <div *ngIf="streamingGenerator.streamData()" class="streaming-text">
    <h3>Streaming Text:</h3>
    <p>{{ streamingGenerator.streamData() }}</p>
  </div>
  
  <div *ngIf="streamingGenerator.data()" class="final-text">
    <h3>Final Text:</h3>
    <p>{{ streamingGenerator.data()?.text }}</p>
  </div>
  
  <div *ngIf="streamingGenerator.error()" class="error">
    Error: {{ streamingGenerator.error() }}
  </div>
</div>
```

### Chat Functionality

#### `createChat(systemPrompt?: string, options?: { model?: SupportedModels })`

Creates a reactive chat session with conversation history.

```typescript
import { createChat } from 'ng-firebase-signals';

@Component({...})
export class ChatComponent {
  chatSession = createChat('You are a helpful assistant.');
  
  // Access reactive state
  messages = this.chatSession.messages;
  status = this.chatSession.status;
  error = this.chatSession.error;
}
```

**Parameters:**
- `systemPrompt` - Optional system prompt to set the AI's behavior
- `options` - Optional configuration including model selection

**Returns:**
- `messages` - Signal containing the conversation messages
- `status` - Signal with current operation status
- `error` - Signal containing any errors
- `sendMessage(content: string)` - Function to send a message
- `clearHistory()` - Function to clear conversation history
- `getConversation()` - Function to get current conversation

**Template Usage:**
```html
<div class="chat-interface">
  <div class="chat-messages">
    <div *ngFor="let message of chatSession.messages()" 
         class="message"
         [class.user-message]="message.role === 'user'"
         [class.model-message]="message.role === 'model'"
         [class.system-message]="message.role === 'system'">
      
      <div class="message-content">{{ message.content }}</div>
      <div class="message-time">{{ message.timestamp | date:'short' }}</div>
    </div>
  </div>
  
  <div class="chat-input">
    <input #messageInput type="text" placeholder="Type your message...">
    <button 
      (click)="sendMessage(messageInput.value); messageInput.value = ''"
      [disabled]="chatSession.status() === 'loading'">
      {{ chatSession.status() === 'loading' ? 'Sending...' : 'Send' }}
    </button>
  </div>
  
  <div class="chat-controls">
    <button (click)="chatSession.clearHistory()">Clear History</button>
  </div>
  
  <div *ngIf="chatSession.error()" class="error">
    Error: {{ chatSession.error() }}
  </div>
</div>
```

### Embeddings

#### `generateEmbeddings(texts: string[], options?: EmbeddingOptions)`

Generates embeddings for the provided texts.

```typescript
import { generateEmbeddings } from 'ng-firebase-signals';

@Component({...})
export class EmbeddingsComponent {
  async generateEmbeddings() {
    try {
      const embeddings = await generateEmbeddings([
        'Hello world',
        'How are you?',
        'Nice to meet you'
      ]);
      
      console.log('Embeddings:', embeddings);
      return embeddings;
    } catch (error) {
      console.error('Failed to generate embeddings:', error);
    }
  }
}
```

**Parameters:**
- `texts` - Array of text strings to generate embeddings for
- `options` - Optional configuration including model selection

**Returns:**
- Promise resolving to the generated embeddings

### Batch Processing

#### `generateBatch(prompts: string[], options?: TextGenerationOptions & { model?: SupportedModels })`

Generates text for multiple prompts in batch.

```typescript
import { generateBatch } from 'ng-firebase-signals';

@Component({...})
export class BatchGenerationComponent {
  async generateBatch() {
    try {
      const results = await generateBatch([
        'Write a haiku about spring',
        'Write a haiku about summer',
        'Write a haiku about autumn',
        'Write a haiku about winter'
      ]);
      
      console.log('Batch results:', results);
      return results;
    } catch (error) {
      console.error('Failed to generate batch:', error);
    }
  }
}
```

**Parameters:**
- `prompts` - Array of text prompts to generate
- `options` - Optional configuration including model, temperature, and safety settings

**Returns:**
- Promise resolving to an array of generated text responses

## Configuration Options

### Text Generation Options

```typescript
export interface TextGenerationOptions {
  temperature?: number;        // 0.0 to 1.0, controls randomness
  maxOutputTokens?: number;    // Maximum tokens in response
  topK?: number;              // Top-k sampling parameter
  topP?: number;              // Top-p sampling parameter
  safetySettings?: SafetySetting[]; // Content safety settings
}
```

### Embedding Options

```typescript
export interface EmbeddingOptions {
  model?: SupportedModels;     // Embedding model to use
  taskType?: string;           // Task type for embeddings
  title?: string;              // Title for the embedding
}
```

### Safety Settings

```typescript
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
```

## Supported Models

The library supports a wide range of Google Generative AI models:

### Text Generation Models
- `gemini-1.0-pro` - Latest Gemini Pro model
- `gemini-1.5-pro` - Gemini 1.5 Pro model
- `gemini-1.5-flash` - Fast Gemini 1.5 Flash model
- `gemini-pro` - Standard Gemini Pro model
- `gemini-pro-vision` - Gemini Pro with vision capabilities

### Embedding Models
- `embedding-001` - Standard embedding model
- `text-embedding-004` - Advanced text embedding model
- `text-embedding-gecko-001` - Efficient embedding model

### Code Generation Models
- `codechat-bison` - Code-focused chat model
- `codechat-bison-32k` - Extended context code model

### Chat Models
- `chat-bison` - Standard chat model
- `chat-bison-32k` - Extended context chat model

## Utility Functions

### AI Utilities

#### `AIUtils`

Pre-built utilities for common AI tasks:

```typescript
import { AIUtils } from 'ng-firebase-signals';

@Component({...})
export class AIUtilitiesComponent {
  // Extract key information from text
  extractKeyInfo(text: string) {
    return AIUtils.extractKeyInfo(text);
  }
  
  // Summarize text
  summarizeText(text: string, maxLength: number = 200) {
    return AIUtils.summarizeText(text, maxLength);
  }
  
  // Translate text
  translateText(text: string, targetLanguage: string) {
    return AIUtils.translateText(text, targetLanguage);
  }
  
  // Analyze sentiment
  analyzeSentiment(text: string) {
    return AIUtils.analyzeSentiment(text);
  }
  
  // Generate creative content
  generateCreative(prompt: string, style: string = 'creative') {
    return AIUtils.generateCreative(prompt, style);
  }
  
  // Code review
  reviewCode(code: string, language: string) {
    return AIUtils.reviewCode(code, language);
  }
}
```

### AI Prompts

#### `AIPrompts`

Pre-built prompt templates for common use cases:

```typescript
import { AIPrompts } from 'ng-firebase-signals';

@Component({...})
export class PromptTemplatesComponent {
  // Writing assistance
  brainstormIdeas(topic: string) {
    return AIPrompts.writing.brainstorm(topic);
  }
  
  createOutline(topic: string) {
    return AIPrompts.writing.outline(topic);
  }
  
  improveText(text: string) {
    return AIPrompts.writing.improve(text);
  }
  
  expandIdea(idea: string) {
    return AIPrompts.writing.expand(idea);
  }
  
  // Analysis
  compareItems(item1: string, item2: string) {
    return AIPrompts.analysis.compare(item1, item2);
  }
  
  analyzeProsCons(topic: string) {
    return AIPrompts.analysis.prosCons(topic);
  }
  
  explainConcept(concept: string) {
    return AIPrompts.analysis.explain(concept);
  }
  
  // Business
  createMarketingCopy(product: string) {
    return AIPrompts.business.marketing(product);
  }
  
  suggestStrategies(business: string) {
    return AIPrompts.business.strategy(business);
  }
  
  performSWOTAnalysis(company: string) {
    return AIPrompts.business.swot(company);
  }
}
```

## Advanced Usage

### Custom Model Configuration

```typescript
import { generateText } from 'ng-firebase-signals';

@Component({...})
export class CustomModelComponent {
  // Custom model with specific settings
  customGenerator = generateText('Write a technical article', {
    model: 'gemini-1.5-pro',
    temperature: 0.3,        // More focused/consistent
    maxOutputTokens: 4096,   // Longer responses
    topK: 20,                // More diverse sampling
    topP: 0.9,               // Nucleus sampling
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      }
    ]
  });
}
```

### Streaming with Progress

```typescript
import { generateTextStream } from 'ng-firebase-signals';

@Component({...})
export class StreamingProgressComponent {
  streamingGenerator = generateTextStream('Write a novel chapter by chapter');
  
  async startStreaming() {
    await this.streamingGenerator.generate();
    
    // Monitor streaming progress
    const unsubscribe = effect(() => {
      const streamData = this.streamingGenerator.streamData();
      if (streamData) {
        console.log(`Streaming progress: ${streamData.length} characters`);
        
        // Update UI with streaming text
        this.updateStreamingUI(streamData);
      }
    });
    
    // Cleanup when done
    effect(() => {
      if (this.streamingGenerator.status() === 'success') {
        unsubscribe();
        console.log('Streaming completed');
      }
    });
  }
  
  private updateStreamingUI(text: string) {
    // Update your UI with streaming text
    this.streamingTextElement.textContent = text;
  }
}
```

### Chat with Memory Management

```typescript
import { createChat } from 'ng-firebase-signals';

@Component({...})
export class ChatMemoryComponent {
  chatSession = createChat('You are a helpful assistant with a good memory.');
  
  // Save chat history to localStorage
  saveChatHistory() {
    const conversation = this.chatSession.getConversation();
    localStorage.setItem('chatHistory', JSON.stringify(conversation));
  }
  
  // Load chat history from localStorage
  loadChatHistory() {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      const conversation = JSON.parse(saved);
      // Note: You'll need to implement a way to restore conversation state
      console.log('Loaded conversation:', conversation);
    }
  }
  
  // Clear chat and save
  clearAndSave() {
    this.chatSession.clearHistory();
    this.saveChatHistory();
  }
}
```

### Error Handling and Retry Logic

```typescript
import { generateText } from 'ng-firebase-signals';

@Component({...})
export class ErrorHandlingComponent {
  textGenerator = generateText('Write a story');
  
  async generateWithRetry(maxRetries: number = 3) {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        await this.textGenerator.generate();
        
        if (this.textGenerator.status() === 'success') {
          return this.textGenerator.data();
        }
        
        if (this.textGenerator.error()) {
          console.warn(`Attempt ${attempts + 1} failed:`, this.textGenerator.error());
          attempts++;
          
          if (attempts < maxRetries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
      } catch (error) {
        console.error(`Attempt ${attempts + 1} error:`, error);
        attempts++;
      }
    }
    
    throw new Error(`Failed after ${maxRetries} attempts`);
  }
}
```

## Complete Example

```typescript
import { Component, inject } from '@angular/core';
import { 
  generateText, 
  generateTextStream,
  createChat,
  generateEmbeddings,
  AIUtils,
  AIPrompts 
} from 'ng-firebase-signals';

@Component({
  selector: 'app-ai-dashboard',
  template: `
    <div class="ai-dashboard">
      <!-- Text Generation -->
      <div class="section">
        <h2>Text Generation</h2>
        <textarea #promptInput placeholder="Enter your prompt..."></textarea>
        <button (click)="generateText(promptInput.value)">Generate</button>
        
        <div *ngIf="textGenerator.data()" class="result">
          <h3>Generated Text:</h3>
          <p>{{ textGenerator.data()?.text }}</p>
        </div>
        
        <div *ngIf="textGenerator.status() === 'loading'" class="loading">
          Generating...
        </div>
      </div>
      
      <!-- Streaming Generation -->
      <div class="section">
        <h2>Streaming Generation</h2>
        <textarea #streamPromptInput placeholder="Enter your prompt..."></textarea>
        <button (click)="startStreaming(streamPromptInput.value)">Start Streaming</button>
        
        <div *ngIf="streamingGenerator.streamData()" class="streaming-result">
          <h3>Streaming:</h3>
          <p>{{ streamingGenerator.streamData() }}</p>
        </div>
        
        <div *ngIf="streamingGenerator.status() === 'streaming'" class="streaming">
          Streaming in progress...
        </div>
      </div>
      
      <!-- Chat Interface -->
      <div class="section">
        <h2>Chat</h2>
        <div class="chat-messages">
          <div *ngFor="let message of chatSession.messages()" 
               class="message"
               [class.user]="message.role === 'user'"
               [class.assistant]="message.role === 'model'">
            {{ message.content }}
          </div>
        </div>
        
        <div class="chat-input">
          <input #chatInput type="text" placeholder="Type your message...">
          <button (click)="sendMessage(chatInput.value); chatInput.value = ''">Send</button>
        </div>
        
        <button (click)="chatSession.clearHistory()">Clear Chat</button>
      </div>
      
      <!-- AI Utilities -->
      <div class="section">
        <h2>AI Utilities</h2>
        <textarea #utilityInput placeholder="Enter text for analysis..."></textarea>
        
        <div class="utility-buttons">
          <button (click)="extractKeyInfo(utilityInput.value)">Extract Key Info</button>
          <button (click)="summarizeText(utilityInput.value)">Summarize</button>
          <button (click)="analyzeSentiment(utilityInput.value)">Analyze Sentiment</button>
        </div>
        
        <div *ngIf="utilityResult" class="utility-result">
          <h3>Result:</h3>
          <p>{{ utilityResult }}</p>
        </div>
      </div>
      
      <!-- Prompt Templates -->
      <div class="section">
        <h2>Prompt Templates</h2>
        <input #topicInput placeholder="Enter topic...">
        
        <div class="template-buttons">
          <button (click)="brainstormIdeas(topicInput.value)">Brainstorm Ideas</button>
          <button (click)="createOutline(topicInput.value)">Create Outline</button>
          <button (click)="analyzeProsCons(topicInput.value)">Pros & Cons</button>
        </div>
        
        <div *ngIf="templateResult" class="template-result">
          <h3>Generated Prompt:</h3>
          <p>{{ templateResult }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 8px;
    }
    
    textarea, input {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    
    button:hover {
      background: #0056b3;
    }
    
    .result, .streaming-result, .utility-result, .template-result {
      margin-top: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    
    .chat-messages {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #ddd;
      padding: 10px;
      margin: 10px 0;
    }
    
    .message {
      margin: 10px 0;
      padding: 10px;
      border-radius: 4px;
    }
    
    .message.user {
      background: #e3f2fd;
      margin-left: 20%;
    }
    
    .message.assistant {
      background: #f3e5f5;
      margin-right: 20%;
    }
    
    .loading, .streaming {
      color: #007bff;
      font-style: italic;
    }
  `]
})
export class AIDashboardComponent {
  // AI operations
  textGenerator = generateText('');
  streamingGenerator = generateTextStream('');
  chatSession = createChat('You are a helpful AI assistant.');
  
  // Results
  utilityResult: string = '';
  templateResult: string = '';
  
  async generateText(prompt: string) {
    if (prompt.trim()) {
      this.textGenerator = generateText(prompt);
      await this.textGenerator.generate();
    }
  }
  
  async startStreaming(prompt: string) {
    if (prompt.trim()) {
      this.streamingGenerator = generateTextStream(prompt);
      await this.streamingGenerator.generate();
    }
  }
  
  async sendMessage(content: string) {
    if (content.trim()) {
      await this.chatSession.sendMessage(content);
    }
  }
  
  // AI Utilities
  extractKeyInfo(text: string) {
    if (text.trim()) {
      this.utilityResult = AIUtils.extractKeyInfo(text);
    }
  }
  
  summarizeText(text: string) {
    if (text.trim()) {
      this.utilityResult = AIUtils.summarizeText(text, 150);
    }
  }
  
  analyzeSentiment(text: string) {
    if (text.trim()) {
      this.utilityResult = AIUtils.analyzeSentiment(text);
    }
  }
  
  // Prompt Templates
  brainstormIdeas(topic: string) {
    if (topic.trim()) {
      this.templateResult = AIPrompts.writing.brainstorm(topic);
    }
  }
  
  createOutline(topic: string) {
    if (topic.trim()) {
      this.templateResult = AIPrompts.writing.outline(topic);
    }
  }
  
  analyzeProsCons(topic: string) {
    if (topic.trim()) {
      this.templateResult = AIPrompts.analysis.prosCons(topic);
    }
  }
}
```

## Best Practices

1. **Compose Functions**: Mix and match AI functions as needed
2. **Handle Loading States**: Always check status signals in your templates
3. **Error Handling**: Display error signals for better user experience
4. **Model Selection**: Choose appropriate models for your use case
5. **Safety Settings**: Configure safety settings based on your content requirements
6. **Rate Limiting**: Implement rate limiting for production applications
7. **Cost Management**: Monitor API usage and implement caching where appropriate
8. **Cleanup**: Functions automatically clean up when components are destroyed

## Status Types

All AI functions return a consistent status pattern:

```typescript
export type AIStatus = 'idle' | 'loading' | 'success' | 'error' | 'streaming';
```

- `idle` - Operation hasn't started
- `loading` - Operation in progress
- `success` - Operation completed successfully
- `error` - Operation failed with an error
- `streaming` - Streaming operation in progress

## Error Handling

All AI functions provide error signals that you can use to display user-friendly error messages:

```typescript
// Check for errors
if (textGenerator.error()) {
  console.error('Text generation failed:', textGenerator.error());
}

// Display in template
<div *ngIf="textGenerator.error()" class="error-message">
  {{ textGenerator.error() }}
</div>
```

## Security Considerations

- **API Key Security**: Never expose API keys in client-side code
- **Content Filtering**: Use appropriate safety settings for your application
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Input Validation**: Validate user inputs before sending to AI models
- **Content Moderation**: Review AI-generated content before displaying
- **Privacy**: Be aware of data privacy implications when using AI services

## Cost Optimization

- **Model Selection**: Use appropriate models for your use case
- **Token Management**: Monitor token usage and implement caching
- **Batch Operations**: Use batch operations when possible
- **Streaming**: Use streaming for long-form content to improve user experience
- **Caching**: Cache common responses to reduce API calls

## Troubleshooting

### Common Issues

#### API Key Not Configured
**Problem**: Error "Google AI not configured"
**Solution**: Ensure you've provided `googleAI.apiKey` in your Firebase configuration

#### Model Not Supported
**Problem**: Error with specific model
**Solution**: Check the `SupportedModels` type for available models

#### Rate Limiting
**Problem**: Too many requests error
**Solution**: Implement rate limiting and exponential backoff

#### Content Filtering
**Problem**: Content blocked by safety settings
**Solution**: Adjust safety settings or modify your prompt

### Debug Mode

```typescript
// Enable debug logging
if (environment.production === false) {
  console.log('AI Status:', {
    textGenerator: this.textGenerator.status(),
    streamingGenerator: this.streamingGenerator.status(),
    chatSession: this.chatSession.status()
  });
  
  console.log('AI Data:', {
    textGenerator: this.textGenerator.data(),
    streamingGenerator: this.streamingGenerator.streamData(),
    chatSession: this.chatSession.messages()
  });
}
```
