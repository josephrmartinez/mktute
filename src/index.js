import 'dotenv/config';
import { selectCommits, getGitDiff } from './gitUtils.js';
import getAiResponse from './aiUtils.js';
import { createLoadingIndicator, generateFileName } from './cliUtils.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';


export async function runMktute() {
    // 1. Set ai api if not already accessible to shell
    if (!process.env.OPENAI_API_KEY) {
        const { apiKey } = await inquirer.prompt({
          type: 'password',
          name: 'apiKey',
          message: 'Set OPENAI_API_KEY env variable: ',
        });
        process.env.OPENAI_API_KEY = apiKey;
      }
    
    // 2. User selects commits
    // TODO: update to only allow end commit to be from AFTER selected start commit
    // TODO: return entire contents of updated file(s)
    const { startCommit, endCommit } = await selectCommits();  
    const gitDiff = await getGitDiff(startCommit, endCommit);
    
    // 3. Enter tutorial topic
    const { topic } = await inquirer.prompt({
      type: 'input',
      name: 'topic',
      message: 'Enter tutorial topic:'
    });
      
    // 4. TODO: allow user to specify ai model? Local option?

    // 5. TODO: add confirmation stage with estimated cost
    
    // 6. Start and display the loading indicator
    const loadingIndicator = createLoadingIndicator();
    loadingIndicator.start();
   
    try {
      // 8. Fetch ai response  
      const aiResponse = await getAiResponse(gitDiff, topic);
        
      // 9. Stop and clear the loading indicator
      loadingIndicator.stop()
    
      // 10. Display file name and generation cost
      const tutorial = aiResponse.choices[0].message.content
      const inputTokens = aiResponse.usage.prompt_tokens
      const outputTokens = aiResponse.usage.completion_tokens
      // const cost = (inputTokens / 1000 * 0.005) + (outputTokens / 1000 * 0.015) // gpt-4o
      const cost = (inputTokens / 1000 * 0.01) + (outputTokens / 1000 * 0.03) // gpt-4-turbo

      const fileName = generateFileName();
      fs.writeFileSync(path.join(process.cwd(), fileName), tutorial);

      console.log(chalk.green(`New tutorial drafted: "${fileName}"`));
      console.log(chalk.cyan(`Generation cost: $${cost.toFixed(4)}`));
    } catch (error) {
      loadingIndicator.stop()
      if (error.status === 401) {
        console.log("Invalid api key. See how to set your API key: https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety#h_a1ab3ba7b2")
        // console.log(error)
        process.exit(1);
      }
      if (error.status === 429) {
      console.log("Rate limit reached or you've exceeded your current quota. Please check your plan and billing details.")
      process.exit(1);
      } else {
        console.log("Error:", error)
      }
    }
 
}

