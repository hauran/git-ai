import simpleGit, { SimpleGit, DiffResult } from 'simple-git';
import type { GitDiff, GitFile } from './types.js';

export class GitService {
  private git: SimpleGit;

  constructor(workingDir?: string) {
    this.git = simpleGit(workingDir);
  }

  async isValidRepository(): Promise<boolean> {
    try {
      await this.git.checkIsRepo();
      return true;
    } catch {
      return false;
    }
  }

  async getStagedDiff(): Promise<GitDiff> {
    try {
      const isRepo = await this.isValidRepository();
      if (!isRepo) {
        throw new Error('Not in a git repository');
      }

      const status = await this.git.status();
      
      if (status.staged.length === 0) {
        throw new Error('No staged changes found. Stage your changes with "git add" first.');
      }

      // Get the raw diff
      const rawDiff = await this.git.diff(['--staged']);
      
      if (!rawDiff.trim()) {
        throw new Error('No staged changes found');
      }

      // Get diff summary
      const diffSummary = await this.git.diffSummary(['--staged']);
      
      // Parse individual files
      const files = await this.parseGitFiles(diffSummary);

      return {
        files,
        summary: {
          insertions: diffSummary.insertions,
          deletions: diffSummary.deletions,
          filesChanged: diffSummary.files.length,
        },
        raw: rawDiff,
      };
    } catch (error) {
      throw new Error(`Failed to get git diff: ${error}`);
    }
  }

  private async parseGitFiles(diffSummary: DiffResult): Promise<GitFile[]> {
    const files: GitFile[] = [];

    for (const file of diffSummary.files) {
      // Get individual file diff
      const fileDiff = await this.git.diff(['--staged', '--', file.file]);
      
      let status: GitFile['status'] = 'modified';
      
      // Check if file has insertions/deletions properties (text files)
      const hasStats = 'insertions' in file && 'deletions' in file;
      const insertions = hasStats ? file.insertions : 0;
      const deletions = hasStats ? file.deletions : 0;
      
      // Determine file status based on insertions/deletions
      if (hasStats) {
        if (insertions > 0 && deletions === 0) {
          status = 'added';
        } else if (insertions === 0 && deletions > 0) {
          status = 'deleted';
        }
      }
      
      // Check for renames by looking at the diff content
      if (fileDiff.includes('similarity index') || fileDiff.includes('rename from')) {
        status = 'renamed';
      }

      files.push({
        path: file.file,
        status,
        insertions,
        deletions,
        diff: fileDiff,
      });
    }

    return files;
  }

  async getCurrentBranch(): Promise<string> {
    try {
      const branchSummary = await this.git.branchLocal();
      return branchSummary.current;
    } catch (error) {
      throw new Error(`Failed to get current branch: ${error}`);
    }
  }

  async getRepoName(): Promise<string | undefined> {
    try {
      const remotes = await this.git.getRemotes(true);
      const origin = remotes.find(remote => remote.name === 'origin');
      
      if (origin?.refs.fetch) {
        const match = origin.refs.fetch.match(/\/([^\/]+)\.git$/);
        return match?.[1];
      }
      
      return undefined;
    } catch {
      return undefined;
    }
  }

  async getRecentCommits(count: number = 5): Promise<string[]> {
    try {
      const log = await this.git.log({ maxCount: count });
      return log.all.map(commit => commit.message);
    } catch {
      return [];
    }
  }

  async commit(message: string): Promise<void> {
    try {
      await this.git.commit(message);
    } catch (error) {
      throw new Error(`Failed to commit: ${error}`);
    }
  }

  async hasStagedChanges(): Promise<boolean> {
    try {
      const status = await this.git.status();
      return status.staged.length > 0;
    } catch {
      return false;
    }
  }

  async getWorkingDirectory(): Promise<string> {
    try {
      const result = await this.git.revparse(['--show-toplevel']);
      return result.trim();
    } catch (error) {
      throw new Error(`Failed to get working directory: ${error}`);
    }
  }
}

export const gitService = new GitService(); 