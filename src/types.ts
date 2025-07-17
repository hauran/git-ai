export interface GitDiff {
  files: GitFile[];
  summary: {
    insertions: number;
    deletions: number;
    filesChanged: number;
  };
  raw: string;
}

export interface GitFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied';
  insertions: number;
  deletions: number;
  diff: string;
  oldPath?: string; // for renamed files
}

export interface CommitMessage {
  title: string;
  body?: string;
  type?: CommitType;
  scope?: string;
  breaking?: boolean;
  footer?: string;
}

export type CommitType = 
  | 'feat' 
  | 'fix' 
  | 'docs' 
  | 'style' 
  | 'refactor' 
  | 'test' 
  | 'chore'
  | 'perf'
  | 'ci'
  | 'build'
  | 'revert';

export interface AIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  organization?: string;
}

export interface CLIOptions {
  commit?: boolean;
  interactive?: boolean;
  style?: CommitStyle;
  dryRun?: boolean;
  verbose?: boolean;
  config?: boolean;
}

export type CommitStyle = 'conventional' | 'standard' | 'detailed';

export interface AppConfig {
  ai: AIConfig;
  git: {
    defaultStyle: CommitStyle;
    maxDiffSize: number;
    excludeFiles: string[];
  };
  ui: {
    colorOutput: boolean;
    showDiff: boolean;
  };
}

export interface AIPromptContext {
  diff: GitDiff;
  style: CommitStyle;
  repoName?: string;
  branch?: string;
  previousCommits?: string[];
}

export interface GeneratedCommit {
  message: CommitMessage;
  confidence: number;
  reasoning?: string;
}

export class GitAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'GitAIError';
  }
}

export class ConfigError extends GitAIError {
  constructor(message: string, cause?: Error) {
    super(message, 'CONFIG_ERROR', cause);
  }
}

export class GitError extends GitAIError {
  constructor(message: string, cause?: Error) {
    super(message, 'GIT_ERROR', cause);
  }
}

export class AIError extends GitAIError {
  constructor(message: string, cause?: Error) {
    super(message, 'AI_ERROR', cause);
  }
} 