import simpleGit from 'simple-git';
import inquirer from 'inquirer';

const git = simpleGit();

export async function selectCommits() {
  const log = await git.log();
  const choices = log.all.map(commit => ({
    name: `${commit.hash} - ${commit.message}`,
    value: commit.hash
  }));

  const { startCommit, endCommit } = await inquirer.prompt([
    {
      type: 'list',
      name: 'startCommit',
      message: 'Select start commit:',
      choices
    },
    {
      type: 'list',
      name: 'endCommit',
      message: 'Select end commit:',
      choices
    }
  ]);

  return { startCommit, endCommit };
}

/**
  * Get the diff between two commits, where the commits could be the same.
* @param startCommit - The commit hash of the start commit
* @param endCommit - The commit hash of the end commit
*/
export async function getGitDiff(startCommit: string, endCommit: string) {
  const diff = await git.diff([startCommit, endCommit]);
  return diff;
}
