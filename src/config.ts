import { config } from 'dotenv';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import type { AppConfig, AIConfig } from './types.js';

// Load environment variables from multiple locations
const loadEnvironmentVariables = () => {
  // 1. Try to load from current working directory (.env)
  config();
  
  // 2. Try to load from home directory (~/.env)
  const homeEnvPath = join(homedir(), '.env');
  if (existsSync(homeEnvPath)) {
    config({ path: homeEnvPath });
  }
  
  // 3. Try to load from git-ai config directory (~/.git-ai/.env)
  const configEnvPath = join(homedir(), '.git-ai', '.env');
  if (existsSync(configEnvPath)) {
    config({ path: configEnvPath });
  }
};

loadEnvironmentVariables();

const CONFIG_DIR = join(homedir(), '.git-ai');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: AppConfig = {
  ai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '100'),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    organization: process.env.OPENAI_ORGANIZATION,
  },
  git: {
    defaultStyle: (process.env.DEFAULT_COMMIT_STYLE as any) || 'detailed',
    maxDiffSize: 50000, // 50KB max diff size
    excludeFiles: ['package-lock.json', 'yarn.lock', '*.min.js', '*.map'],
  },
  ui: {
    colorOutput: true,
    showDiff: false,
  },
};

export class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    try {
      // Start with defaults (which already include env vars)
      let mergedConfig = { ...DEFAULT_CONFIG };
      
      // Override with file config if it exists
      if (existsSync(CONFIG_FILE)) {
        const fileConfig = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
        mergedConfig = { ...mergedConfig, ...fileConfig };
      }
      
      // Always prioritize environment variables over file config
      mergedConfig.ai = {
        ...mergedConfig.ai,
        apiKey: process.env.OPENAI_API_KEY || mergedConfig.ai.apiKey,
        model: process.env.AI_MODEL || mergedConfig.ai.model,
        maxTokens: parseInt(process.env.AI_MAX_TOKENS || '') || mergedConfig.ai.maxTokens,
        temperature: parseFloat(process.env.AI_TEMPERATURE || '') || mergedConfig.ai.temperature,
        organization: process.env.OPENAI_ORGANIZATION || mergedConfig.ai.organization,
      };
      
      if (process.env.DEFAULT_COMMIT_STYLE) {
        mergedConfig.git.defaultStyle = process.env.DEFAULT_COMMIT_STYLE as any;
      }
      
      return mergedConfig;
    } catch (error) {
      console.warn('Failed to load config file, using defaults with env vars');
      return DEFAULT_CONFIG;
    }
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  getAIConfig(): AIConfig {
    const { ai } = this.config;
    
    if (!ai.apiKey) {
      throw new Error(
        'OpenAI API key not found. Please choose one of these options:\n\n' +
        '1. Create a global .env file:\n' +
        '   echo "OPENAI_API_KEY=your_key_here" > ~/.git-ai/.env\n\n' +
        '2. Create a user-wide .env file:\n' +
        '   echo "OPENAI_API_KEY=your_key_here" > ~/.env\n\n' +
        '3. Set environment variable:\n' +
        '   export OPENAI_API_KEY=your_key_here\n\n' +
        '4. Use CLI config:\n' +
        '   git-ai config --api-key YOUR_KEY\n\n' +
        'Get your API key from: https://platform.openai.com/api-keys'
      );
    }

    return ai;
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  setAPIKey(apiKey: string): void {
    this.config.ai.apiKey = apiKey;
    this.saveConfig();
  }

  private saveConfig(): void {
    try {
      if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true });
      }
      writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  validateConfig(): boolean {
    const { ai } = this.config;
    
    if (!ai.apiKey) {
      return false;
    }

    if (ai.maxTokens < 10 || ai.maxTokens > 4000) {
      throw new Error('maxTokens must be between 10 and 4000');
    }

    if (ai.temperature < 0 || ai.temperature > 2) {
      throw new Error('temperature must be between 0 and 2');
    }

    return true;
  }

  getConfigPath(): string {
    return CONFIG_FILE;
  }
}

// Singleton instance
export const configManager = new ConfigManager(); 