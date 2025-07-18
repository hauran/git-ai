#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import type { CLIOptions } from './types.js';
import { generateCommitMessage } from './index.js';
import { configManager } from './config.js';

const program = new Command();

program
  .name('git-ai')
  .description('🤖 AI-powered git commit message generator')
  .version('1.0.0');

// Main command - generate commit message
program
  .option('-c, --commit', 'automatically commit with generated message')
  .option('-i, --interactive', 'interactive mode for message review')
  .option('-s, --style <type>', 'commit message style (conventional|standard|detailed)', 'conventional')
  .option('--dry-run', 'show what would be committed without committing')
  .option('-v, --verbose', 'verbose output')
  .action(async (options: CLIOptions) => {
    try {
      await generateCommitMessage(options);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), (error as Error).message);
      if (options.verbose && error instanceof Error) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('Configure git-ai settings')
  .option('--api-key <key>', 'set OpenAI API key')
  .option('--model <model>', 'set AI model (gpt-3.5-turbo, gpt-4, etc.)')
  .option('--style <style>', 'set default commit style')
  .option('--show', 'show current configuration')
  .action(async (options) => {
    try {
      if (options.show) {
        const config = configManager.getConfig();
        console.log(chalk.blue('Current Configuration:'));
        console.log(JSON.stringify(config, null, 2));
        return;
      }

      if (options.apiKey) {
        configManager.setAPIKey(options.apiKey);
        console.log(chalk.green('✅ API key saved successfully'));
      }

      if (options.model) {
        configManager.updateConfig({ 
          ai: { ...configManager.getConfig().ai, model: options.model } 
        });
        console.log(chalk.green(`✅ Model set to ${options.model}`));
      }

      if (options.style) {
        configManager.updateConfig({ 
          git: { ...configManager.getConfig().git, defaultStyle: options.style } 
        });
        console.log(chalk.green(`✅ Default style set to ${options.style}`));
      }

      if (!options.apiKey && !options.model && !options.style) {
        console.log(chalk.yellow('Use --api-key, --model, --style, or --show'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Config error:'), (error as Error).message);
      process.exit(1);
    }
  });

// Help examples
program.addHelpText('after', `

Examples:
  ${chalk.cyan('git-ai')}                          Generate commit message from staged changes
  ${chalk.cyan('git-ai --commit')}                 Generate and commit automatically
  ${chalk.cyan('git-ai --interactive')}            Review message before committing
  ${chalk.cyan('git-ai --style conventional')}     Use conventional commit format
  ${chalk.cyan('git-ai config --api-key KEY')}     Set your OpenAI API key
  ${chalk.cyan('git-ai config --show')}            Show current configuration

First time setup:
  1. Get an API key from https://platform.openai.com/api-keys
  2. Create a global .env file: ${chalk.cyan('echo "OPENAI_API_KEY=your_key_here" > ~/.git-ai/.env')}
  3. Stage your changes: ${chalk.cyan('git add .')}
  4. Generate commit: ${chalk.cyan('git-ai')}

Alternative setup methods:
  • User-wide .env: ${chalk.cyan('echo "OPENAI_API_KEY=your_key_here" > ~/.env')}
  • Environment variable: ${chalk.cyan('export OPENAI_API_KEY=your_key_here')}
  • Config command: ${chalk.cyan('git-ai config --api-key YOUR_KEY')}
`);

program.parse(); 