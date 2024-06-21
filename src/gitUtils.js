import simpleGit from 'simple-git';
import inquirer from 'inquirer';
import fs from "fs"

const git = simpleGit();


export async function selectCommits() {
  const log = await git.log();
  const choices = log.all.map(commit => ({
    name: `${commit.hash.slice(-7)} - ${commit.message}`,
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

export async function getUpdatedFileContent(startCommit, endCommit) {

  const files = await git.diff(['--name-only', startCommit, endCommit])
  // console.log("files:", files) // These are the routes of files updated. 
  const fileArray = files.split('\n')
  const filteredFileArray = fileArray.filter(fileName => fileName!== "" && fileName!== "package-lock.json");
  const numberOfFilesUpdated = filteredFileArray.length;
  let updatedFilesContents = `* NUMBER OF FILES UPDATED: ${numberOfFilesUpdated} * \n* FULL TEXT OF ALL UPDATED FILES: *\n\n`
  for (const fileName of filteredFileArray) {
    if (fileName !== "" && fileName!== "package-lock.json") {
      updatedFilesContents += "*** PATH OF UPDATED FILE: " + fileName + " ***\n*** UPDATED FILE CONTENT: ***\n";
      updatedFilesContents += fs.readFileSync(fileName, 'utf-8')
      updatedFilesContents += `\n***END OF UPDATED ${fileName} FILE***\n\n`;
    }
  }
  return updatedFilesContents;

}

export async function getDiffsAndContent(startCommit, endCommit) {  
  let diff = `* GIT DIFFs SHOWING CHANGES MADE: *\n`
  diff += await git.diff([startCommit, endCommit]);
  diff += '*** END OF GIT DIFFS ***'

  const updatedFileContent = await getUpdatedFileContent(startCommit, endCommit);

  return diff + updatedFileContent;
}