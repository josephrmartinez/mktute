import 'dotenv/config';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { selectCommits, getDiffsAndContent } from './gitUtils.js';
import { getOpenAIResponse, getAnthropicResponse, getOllamaResponse, estimateCost } from './aiUtils.js';
import { createLoadingIndicator, generateFileName } from './cliUtils.js';

export async function runMktute() {
  // Select commits
  const { startCommit, endCommit } = await selectCommits();  
  const diffsAndContent = await getDiffsAndContent(startCommit, endCommit);
  
  // Drop git diffs into local file for debugging
  // fs.writeFileSync("./diffsAndContent.md", diffsAndContent);  

  // Enter tutorial topic
  const { topic } = await inquirer.prompt({
    type: 'input',
    name: 'topic',
    message: 'Enter tutorial topic:'
  });
  
  const costEstimate = estimateCost(diffsAndContent)
  
  // Select AI model: Local llama 3, Claude Sonnet, GPT-4 
  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select AI provider:',
      choices: [{ name: `LOCAL - Ollama Llama3 - $0.000`, value: "OLLAMA"}, { name: `Anthropic - Claude 3.5 Sonnet - $${costEstimate.anthropic}`, value: "ANTHROPIC"}, {name: `OpenAI - GPT-4.0 - $${costEstimate.openAI}`, value: "OPENAI"}]
    }]);
  
  // Set AI API key for selected provider if not already accessible to shell
  if (provider !== "OLLAMA") {
    const envVarName = `${provider}_API_KEY`;

    if (!process.env[envVarName]) {
        const { apiKey } = await inquirer.prompt({
          type: 'password',
          name: 'apiKey',
          message: `Set ${envVarName} env variable: `,
        });
        process.env[envVarName] = apiKey;
      }
  }
  
  // Start and display the loading indicator if doing external API call
  const loadingIndicator = createLoadingIndicator();

  let response;

  try {
    if (provider === "OPENAI" || provider === "ANTHROPIC") {
      loadingIndicator.start();
    }

    switch (provider) {
      case "OPENAI":
        response = await getOpenAIResponse(diffsAndContent, topic);
        break;
      case "ANTHROPIC":
        response = await getAnthropicResponse(diffsAndContent, topic);
        break;
      case "OLLAMA":
        response = await getOllamaResponse(diffsAndContent, topic);
        break;
      default:
        throw new Error("Unsupported provider.")
    }

    if (provider === "OPENAI" || provider === "ANTHROPIC") {
      // Stop and clear the loading indicator
      loadingIndicator.stop()
    }
  
    // Write response to file in current working directory
    const fileName = generateFileName();
    fs.writeFileSync(path.join(process.cwd(), fileName), response.tutorial);

    console.log(chalk.green(`\nTutorial saved in cwd: "${fileName}"`));
    console.log(chalk.cyan(`Generation cost: $${response.cost}`));
  } catch (error) {
    loadingIndicator.stop()
    if (error.status === 401) {
      console.log("Invalid api key.")
      // console.log(error)
      process.exit(1);
    } else if (error.status === 429) {
    console.log("Rate limit reached or you've exceeded your current quota. Please check your plan and billing details.")
    process.exit(1);
    }
    else if (error instanceof TypeError && error.message.includes('fetch failed')) {
      console.log("Fetch operation failed. Make sure the Ollama app is installed and running.");
    }
    else {
      console.log("An unexpected error occurred:", error.message);
    }
  }
 
}

