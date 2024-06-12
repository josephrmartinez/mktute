import 'dotenv/config';
import { selectCommits, getGitDiff } from './gitUtils.js';
import { getOpenAIResponse, getAnthropicResponse, estimateCost } from './aiUtils.js';
import { createLoadingIndicator, generateFileName } from './cliUtils.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';


export async function runMktute() {
  // Select commits
  const { startCommit, endCommit } = await selectCommits();  
  const gitDiff = await getGitDiff(startCommit, endCommit);
  
  // fs.writeFileSync("./gitdiffs.md", gitDiff); // Drop git diffs into local file for debugging 

  // Enter tutorial topic
  const { topic } = await inquirer.prompt({
    type: 'input',
    name: 'topic',
    message: 'Enter tutorial topic:'
  });
  
  const costEstimate = estimateCost(gitDiff)
  
  // Select AI model: GPT-4, Claude Opus
  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select AI provider:',
      choices: [{ name: `Anthropic - Claude Sonnet - $${costEstimate.anthropic}`, value: "ANTHROPIC"}, {name: `OpenAI - GPT-4.0 - $${costEstimate.openAI}`, value: "OPENAI"}]
    }]);
  console.log(`Selected provider: ${provider}`);
  
  // Set AI API key for selected provider if not already accessible to shell
  const envVarName = `${provider}_API_KEY`;

  if (!process.env[envVarName]) {
      const { apiKey } = await inquirer.prompt({
        type: 'password',
        name: 'apiKey',
        message: `Set ${envVarName} env variable: `,
      });
      process.env[envVarName] = apiKey;
    }
  
  // Start and display the loading indicator
  const loadingIndicator = createLoadingIndicator();
  loadingIndicator.start();
  
  let response;

  try {
    switch (provider) {
      case "OPENAI":
        response = await getOpenAIResponse(gitDiff, topic);
        break;
      case "ANTHROPIC":
        response = await getAnthropicResponse(gitDiff, topic);
        break;
      default:
        throw new Error("Unsupported provider.")
    }

    // Stop and clear the loading indicator
    loadingIndicator.stop()
  
    // Write response to file in current working directory
    const fileName = generateFileName();
    fs.writeFileSync(path.join(process.cwd(), fileName), response.tutorial);

    console.log(chalk.green(`New tutorial drafted: "${fileName}"`));
    console.log(chalk.cyan(`Generation cost: $${response.cost}`));
  } catch (error) {
    loadingIndicator.stop()
    if (error.status === 401) {
      console.log("Invalid api key.")
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

