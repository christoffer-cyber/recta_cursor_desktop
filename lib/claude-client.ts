import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeClient {
  private anthropic: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    this.anthropic = new Anthropic({
      apiKey,
    });
  }

  async chat(
    messages: ClaudeMessage[], 
    systemPrompt?: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ClaudeResponse> {
    try {
      const response = await this.anthropic.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return {
        content: content.text,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      console.error('Claude API error:', error);
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API Error: ${error.message}`);
      }
      throw new Error(`Claude client error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async completion(
    prompt: string,
    systemPrompt?: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ClaudeResponse> {
    return this.chat([{ role: 'user', content: prompt }], systemPrompt, options);
  }

  isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  }
}

// Singleton instance
let claudeClient: ClaudeClient | null = null;

export function getClaudeClient(): ClaudeClient {
  if (!claudeClient) {
    claudeClient = new ClaudeClient();
  }
  return claudeClient;
}
