import OpenAI from 'openai';
import type { 
  AIConfig, 
  CommitMessage, 
  CommitStyle, 
  AIPromptContext,
  GeneratedCommit,
} from './types.js';

export class AIService {
  private openai: OpenAI;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
    });
  }

  async generateCommitMessage(context: AIPromptContext): Promise<GeneratedCommit> {
    try {
      const prompt = this.buildPrompt(context);
      
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(context.style),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response generated from AI');
      }

      return this.parseAIResponse(content, context.style);
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API Error: ${error.message}`);
      }
      throw new Error(`Failed to generate commit message: ${error}`);
    }
  }

  private getSystemPrompt(style: CommitStyle): string {
    const basePrompt = `You are an expert software developer who writes clear, description commit messages. 
Analyze the provided git diff and generate an appropriate commit message.`;

    switch (style) {
      case 'conventional':
        return `${basePrompt}

Follow the Conventional Commits specification:
- Format: <type>[optional scope]: <description>
- Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
- Use lowercase for everything
- Add body and footer if breaking changes or additional context needed

Examples:
- feat(auth): add OAuth2 login support
- fix: resolve memory leak in data processing
- docs: update API documentation for v2.0`;

      case 'detailed':
        return `${basePrompt}

Create detailed commit messages with:
- Detailed body explaining what
- Bullet points for multiple changes
- Technical details when relevant`;

      default: // standard
        return `${basePrompt}

Create standard commit messages:
- Clear, concise title describing the change
- Present tense, imperative mood
- No period at the end`;
    }
  }

  private buildPrompt(context: AIPromptContext): string {
    const { diff, style, repoName, branch, previousCommits } = context;
    
    let prompt = `Analyze this git diff and generate a ${style} commit message:\n\n`;
    
    // Add context
    if (repoName) {
      prompt += `Repository: ${repoName}\n`;
    }
    if (branch) {
      prompt += `Branch: ${branch}\n`;
    }
    
    // Add file summary
    prompt += `\nFiles changed (${diff.summary.filesChanged}):\n`;
    diff.files.forEach(file => {
      prompt += `- ${file.status}: ${file.path} (+${file.insertions}/-${file.deletions})\n`;
    });
    
    // Add recent commits for context
    if (previousCommits?.length) {
      prompt += `\nRecent commits for context:\n`;
      previousCommits.slice(0, 3).forEach(commit => {
        prompt += `- ${commit}\n`;
      });
    }
    
    // Add the actual diff (truncated if too long)
    prompt += `\nGit diff:\n\`\`\`diff\n`;
    const truncatedDiff = this.truncateDiff(diff.raw, 3000);
    prompt += truncatedDiff;
    prompt += `\n\`\`\`\n`;
    
    prompt += `\nGenerate a ${style} commit message. Respond with ONLY the commit message, no additional text.`;
    
    return prompt;
  }

  private truncateDiff(diff: string, maxLength: number): string {
    if (diff.length <= maxLength) {
      return diff;
    }
    
    const truncated = diff.substring(0, maxLength);
    const lastNewline = truncated.lastIndexOf('\n');
    
    return truncated.substring(0, lastNewline) + '\n... (diff truncated)';
  }

  private parseAIResponse(content: string, style: CommitStyle): GeneratedCommit {
    // Clean up markdown code blocks and other formatting
    let cleanContent = content.trim();
    
    // Remove markdown code blocks (```...```)
    cleanContent = cleanContent.replace(/^```[\s\S]*?\n/, '').replace(/\n```$/, '');
    
    // Remove any remaining backticks from start/end
    cleanContent = cleanContent.replace(/^`+/, '').replace(/`+$/, '');
    
    const lines = cleanContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('Empty response from AI');
    }

    const title = lines[0].trim();
    const body = lines.slice(1).join('\n').trim() || undefined;
    
    let type: CommitMessage['type'];
    let scope: string | undefined;
    let breaking = false;
    
    // Parse conventional commit format
    if (style === 'conventional') {
      const conventionalMatch = title.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/);
      if (conventionalMatch) {
        type = conventionalMatch[1] as CommitMessage['type'];
        scope = conventionalMatch[2];
        breaking = !!conventionalMatch[3];
      }
    }

    return {
      message: {
        title,
        body,
        type,
        scope,
        breaking,
      },
      confidence: this.calculateConfidence(title, body),
    };
  }

  private calculateConfidence(title: string, body?: string): number {
    let confidence = 0.5; // Base confidence
    
    // Title quality checks
    if (title.length > 10 && title.length <= 50) confidence += 0.2;
    if (title.match(/^[a-z]/)) confidence += 0.1; // Starts with lowercase
    if (!title.endsWith('.')) confidence += 0.1; // No period at end
    if (title.includes(':')) confidence += 0.1; // Has scope/type
    
    // Body quality checks
    if (body && body.length > 20) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }
}

export function createAIService(config: AIConfig): AIService {
  return new AIService(config);
} 