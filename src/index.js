import 'dotenv/config';
import { selectCommits, getGitDiff } from './gitUtils.js';
import getAiResponse from './aiUtils.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

function createSpinner() {
  let i = 0;
  return () => {
    i = ++i % 5; // Change this value to change the number of frames
    return `\r${chalk.yellow(['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦'].join(''))} Fetching AI response... ${i}%`;
  };
}

function generateFileName() {
        const now = new Date();
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const formattedDate = `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
        
        const fileName = `Tutorial_${formattedDate}.md`;
        
        return fileName;
    }

export async function runMktute() {

  const { startCommit, endCommit } = await selectCommits();
  
  if (!process.env.OPENAI_API_KEY) {
    const { apiKey } = await inquirer.prompt({
      type: 'input',
      name: 'apiKey',
      message: 'Set OPENAI_API_KEY env variable: ',
    });
    process.env.OPENAI_API_KEY = apiKey;
  }
    
  const { topic } = await inquirer.prompt({
    type: 'input',
    name: 'topic',
    message: 'Enter tutorial topic:'
  });

    
  // TODO: add confirmation stage with estimated cost
    
  // Start the loading indicator
  const loadingIndicator = createSpinner();
  console.log(loadingIndicator());

  // TODO: update to only allow end commit to be from AFTER selected start commit
  const gitDiff = await getGitDiff(startCommit, endCommit);

  // TODO: allow user to specify ai model?
  const aiResponse = await getAiResponse(gitDiff, topic);
    
  // Stop the loading indicator
  console.log('\n');

  const tutorial = aiResponse.choices[0].message.content
  const inputTokens = aiResponse.usage.prompt_tokens
  const outputTokens = aiResponse.usage.completion_tokens
  // const cost = (inputTokens / 1000 * 0.005) + (outputTokens / 1000 * 0.015) // gpt-4o
  const cost = (inputTokens / 1000 * 0.01) + (outputTokens / 1000 * 0.03) // gpt-4-turbo
  

  

  const fileName = generateFileName();
  fs.writeFileSync(path.join(process.cwd(), fileName), tutorial);

  console.log(chalk.green(`New tutorial drafted: "${fileName}"`));
  console.log(chalk.cyan(`Generation cost: $${cost.toFixed(4)}`));
  
}

