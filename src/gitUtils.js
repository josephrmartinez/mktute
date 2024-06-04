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

export async function getGitDiff(startCommit, endCommit) {
  const diff = await git.diff([startCommit, endCommit]);
  return diff;
}
