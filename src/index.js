import 'dotenv/config';
import { selectCommits, getGitDiff } from './gitUtils.js';
import getAiResponse from './aiUtils.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export async function runMktute() {
  try {
    const { startCommit, endCommit } = await selectCommits();
    
      if (!process.env.OPENAI_API_KEY) {
        const { apiKey } = await inquirer.prompt({
          type: 'input',
          name: 'apiKey',
          message: 'Set OPENAI_API_KEY env variable and rerun mktute: "export OPENAI_API_KEY=\'\'"):',
        });
        process.env.OPENAI_API_KEY = apiKey;
      }
      
    const { topic } = await inquirer.prompt({
      type: 'input',
      name: 'topic',
      message: 'Enter tutorial topic:'
    });

      
    // TODO: add confirmation stage with estimated cost
      
    console.log(chalk.yellow('Fetching AI response...'));

    // TODO: update to only allow end commit to be from AFTER selected start commit
    const gitDiff = await getGitDiff(startCommit, endCommit);

    // TODO: allow user to specify ai model?
    const aiResponse = await getAiResponse(gitDiff, topic);
      
    const tutorial = aiResponse.choices[0].message.content
    const inputTokens = aiResponse.usage.prompt_tokens
    const outputTokens = aiResponse.usage.completion_tokens
    // const cost = (inputTokens / 1000 * 0.005) + (outputTokens / 1000 * 0.015) // gpt-4o
    const cost = (inputTokens / 1000 * 0.01) + (outputTokens / 1000 * 0.03) // gpt-4-turbo
    

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

    const fileName = generateFileName();
    fs.writeFileSync(path.join(process.cwd(), fileName), tutorial);

    console.log(chalk.green(`New tutorial drafted: "${fileName}"`));
    console.log(chalk.cyan(`Generation cost: $${cost.toFixed(4)}`));
  } catch (error) {
    console.error(chalk.red('Error running mktute:'), error);
  }
}

