import chalk from 'chalk';
import type { CommitMessage, CommitStyle } from './types.js';

/**
 * Format a commit message according to the specified style
 */
export function formatCommitMessage(message: CommitMessage, style: CommitStyle): string {
  switch (style) {
    case 'conventional':
      return formatConventionalCommit(message);
    case 'detailed':
      return formatDetailedCommit(message);
    default:
      return formatStandardCommit(message);
  }
}

function formatConventionalCommit(message: CommitMessage): string {
  let formatted = '';
  
  if (message.type) {
    formatted += message.type;
    if (message.scope) {
      formatted += `(${message.scope})`;
    }
    if (message.breaking) {
      formatted += '!';
    }
    formatted += ': ';
  }
  
  formatted += message.title;
  
  if (message.body) {
    formatted += '\n\n' + message.body;
  }
  
  if (message.footer) {
    formatted += '\n\n' + message.footer;
  }
  
  return formatted;
}

function formatDetailedCommit(message: CommitMessage): string {
  let formatted = message.title;
  
  if (message.body) {
    formatted += '\n\n' + message.body;
  }
  
  return formatted;
}

function formatStandardCommit(message: CommitMessage): string {
  return message.title;
}

/**
 * Validate commit message format
 */
export function validateCommitMessage(message: string, style: CommitStyle): boolean {
  if (!message.trim()) {
    return false;
  }

  switch (style) {
    case 'conventional':
      return validateConventionalCommit(message);
    default:
      return validateStandardCommit(message);
  }
}

function validateConventionalCommit(message: string): boolean {
  const conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?!?:\s.+/;
  return conventionalPattern.test(message);
}

function validateStandardCommit(message: string): boolean {
  const lines = message.split('\n');
  const title = lines[0];
  
  // Title should be <= 50 characters and not end with a period
  return title.length <= 50 && !title.endsWith('.');
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Display colored diff summary
 */
export function displayDiffSummary(
  filesChanged: number,
  insertions: number,
  deletions: number
): void {
  console.log(chalk.gray('Changes:'), 
    chalk.yellow(`${filesChanged} file${filesChanged !== 1 ? 's' : ''}`),
    chalk.green(`+${insertions}`),
    chalk.red(`-${deletions}`)
  );
}

/**
 * Create a progress indicator
 */
export function createProgressSpinner(message: string) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  return setInterval(() => {
    process.stdout.write(`\r${chalk.blue(frames[i])} ${message}`);
    i = (i + 1) % frames.length;
  }, 100);
}

/**
 * Stop progress spinner and clear line
 */
export function stopProgressSpinner(interval: NodeJS.Timeout): void {
  clearInterval(interval);
  process.stdout.write('\r\x1b[K'); // Clear line
}

/**
 * Parse git diff to extract changed line numbers
 */
export function parseChangedLines(diff: string): { added: number[]; removed: number[] } {
  const added: number[] = [];
  const removed: number[] = [];
  
  const lines = diff.split('\n');
  let currentLine = 0;
  
  for (const line of lines) {
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
      if (match) {
        currentLine = parseInt(match[2]);
      }
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      added.push(currentLine++);
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      removed.push(currentLine);
    } else if (!line.startsWith('\\')) {
      currentLine++;
    }
  }
  
  return { added, removed };
}

/**
 * Sanitize commit message for shell safety
 */
export function sanitizeCommitMessage(message: string): string {
  // Remove or escape potentially dangerous characters
  return message
    .replace(/[`$\\]/g, '\\$&') // Escape backticks, dollar signs, backslashes
    .replace(/\n/g, '\n\n') // Ensure proper line breaks
    .trim();
} 