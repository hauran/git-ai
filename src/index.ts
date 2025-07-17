import chalk from 'chalk';
import inquirer from 'inquirer';
import type { CLIOptions, CommitStyle, AIPromptContext } from './types.js';
import { gitService } from './git.js';
import { createAIService } from './ai.js';
import { configManager } from './config.js';

export async function generateCommitMessage(options: CLIOptions): Promise<void> {
  try {
    // Validate configuration - the getAIConfig will throw with helpful instructions if not configured
    try {
      configManager.getAIConfig();
    } catch (error) {
      console.log(chalk.yellow('⚠️  Setup required'));
      console.log((error as Error).message);
      return;
    }

    // Check if we're in a git repository
    const isRepo = await gitService.isValidRepository();
    if (!isRepo) {
      throw new Error('Not in a git repository. Initialize with "git init" first.');
    }

    // Check for staged changes
    const hasStagedChanges = await gitService.hasStagedChanges();
    if (!hasStagedChanges) {
      throw new Error('No staged changes found. Stage your changes with "git add" first.');
    }

    console.log(chalk.blue('🔍 Analyzing staged changes...'));

    // Get git diff and context
    const diff = await gitService.getStagedDiff();
    const config = configManager.getConfig();
    const commitStyle: CommitStyle = options.style || config.git.defaultStyle;

    // Show diff summary if verbose
    if (options.verbose) {
      console.log(chalk.gray('\nDiff Summary:'));
      console.log(chalk.gray(`Files changed: ${diff.summary.filesChanged}`));
      console.log(chalk.gray(`Insertions: +${diff.summary.insertions}`));
      console.log(chalk.gray(`Deletions: -${diff.summary.deletions}`));
      console.log();
    }

    // Get additional context
    const [branch, repoName, recentCommits] = await Promise.all([
      gitService.getCurrentBranch().catch(() => 'main'),
      gitService.getRepoName().catch(() => undefined),
      gitService.getRecentCommits(3).catch(() => []),
    ]);

    const context: AIPromptContext = {
      diff,
      style: commitStyle,
      branch,
      repoName,
      previousCommits: recentCommits,
    };

    console.log(chalk.blue('🤖 Generating commit message...'));

    // Generate commit message using AI
    const aiService = createAIService(configManager.getAIConfig());
    const result = await aiService.generateCommitMessage(context);

    // Display the generated message
    console.log('\n' + chalk.green('📝 Generated commit message:'));
    console.log(chalk.white.bold(result.message.title));
    
    if (result.message.body) {
      console.log();
      console.log(chalk.gray(result.message.body));
    }

    // Show confidence score if verbose
    if (options.verbose) {
      const confidenceColor = result.confidence > 0.8 ? chalk.green : 
                            result.confidence > 0.6 ? chalk.yellow : chalk.red;
      console.log(confidenceColor(`\nConfidence: ${Math.round(result.confidence * 100)}%`));
    }

    // Handle different modes
    if (options.dryRun) {
      console.log(chalk.yellow('\n🏃 Dry run - no commit performed'));
      return;
    }

    if (options.interactive || (!options.commit && !options.dryRun)) {
      const action = await promptForAction();
      
      switch (action) {
        case 'commit':
          await performCommit(result.message.title);
          break;
        case 'edit':
          const editedMessage = await promptForEdit(result.message.title);
          if (editedMessage) {
            await performCommit(editedMessage);
          }
          break;
        case 'regenerate':
          console.log(chalk.blue('\n🔄 Regenerating...'));
          await generateCommitMessage({ ...options, interactive: true });
          break;
        case 'cancel':
          console.log(chalk.yellow('👋 Cancelled'));
          break;
      }
    } else if (options.commit) {
      await performCommit(result.message.title);
    }

  } catch (error) {
    throw error;
  }
}

async function promptForAction(): Promise<string> {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '✅ Commit with this message', value: 'commit' },
        { name: '✏️  Edit the message', value: 'edit' },
        { name: '🔄 Regenerate message', value: 'regenerate' },
        { name: '❌ Cancel', value: 'cancel' },
      ],
    },
  ]);

  return action;
}

async function promptForEdit(originalMessage: string): Promise<string | null> {
  const { editedMessage } = await inquirer.prompt([
    {
      type: 'input',
      name: 'editedMessage',
      message: 'Edit your commit message:',
      default: originalMessage,
    },
  ]);

  if (!editedMessage.trim()) {
    console.log(chalk.red('Empty message, cancelling commit'));
    return null;
  }

  return editedMessage.trim();
}

async function performCommit(message: string): Promise<void> {
  try {
    console.log(chalk.blue('\n📦 Committing changes...'));
    await gitService.commit(message);
    console.log(chalk.green('✅ Successfully committed!'));
    
    // Show the commit
    console.log(chalk.gray(`\n"${message}"`));
  } catch (error) {
    throw new Error(`Failed to commit: ${error}`);
  }
} 