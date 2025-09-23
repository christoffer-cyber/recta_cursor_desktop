export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
export const DEFAULT_MAX_TOKENS = Number(process.env.CLAUDE_MAX_TOKENS || 2000); // FIXED: Increased from 1000 to 2000
export const DEFAULT_TEMPERATURE = Number(process.env.CLAUDE_TEMPERATURE || 0.7);
export const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

export const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 8000);

