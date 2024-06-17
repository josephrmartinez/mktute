import 'dotenv/config';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import {selectCommits, getGitDiff} from './gitUtils';
import {getOpenAIResponse, getAnthropicResponse, getOllamaResponse, estimateCost} from './aiUtils';
import {createLoadingIndicator, generateFileName} from './cliUtils';

export async function runMktute() {
  // Select commits
  const {startCommit, endCommit} = await selectCommits();
  const gitDiff = await getGitDiff(startCommit, endCommit);

  // Drop git diffs into local file for debugging
  // fs.writeFileSync("./gitdiffs.md", gitDiff);  

  // Enter tutorial topic
  const {topic} = await inquirer.prompt({
    type: 'input',
    name: 'topic',
    message: 'Enter tutorial topic:'
  });

  const costEstimate = estimateCost(gitDiff)

  // Select AI model: Local llama 3, Claude Sonnet, GPT-4 
  const {provider} = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select AI provider:',
      choices: [{name: `LOCAL - Ollama Llama3 - $0.000`, value: "OLLAMA"}, {name: `Anthropic - Claude Sonnet - $${costEstimate.anthropic}`, value: "ANTHROPIC"}, {name: `OpenAI - GPT-4.0 - $${costEstimate.openAI}`, value: "OPENAI"}]
    }]);

  // Set AI API key for selected provider if not already accessible to shell
  if (provider !== "OLLAMA") {
    const envVarName = `${provider}_API_KEY`;

    if (!process.env[envVarName]) {
      const {apiKey} = await inquirer.prompt({
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
        response = await getOpenAIResponse(gitDiff, topic);
        break;
      case "ANTHROPIC":
        response = await getAnthropicResponse(gitDiff, topic);
        break;
      case "OLLAMA":
        response = await getOllamaResponse(gitDiff, topic);
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
    if (!response.tutorial) throw new Error("No tutorial generated.");
    fs.writeFileSync(path.join(process.cwd(), fileName), response.tutorial);

    console.log(chalk.green(`\nTutorial saved in cwd: "${fileName}"`));
    console.log(chalk.cyan(`Generation cost: $${response.cost}`));
  } catch (error) {
    // If the error is not something that we know how to catch, then rethrow the error
    if (typeof error === "object" && error && ("status" in error || "message" in error)) {
      console.log("An unexpected error occurred:", error);
    }
    // At this point, we know that the error is something we can catch; i.e. it has either .status or .message
    const typedError = error as {status: number, message: string}

    loadingIndicator.stop()
    if (typedError.status === 401) {
      console.log("Invalid api key.")
      // console.log(typedError)
      process.exit(1);
    } else if (typedError.status === 429) {
      console.log("Rate limit reached or you've exceeded your current quota. Please check your plan and billing details.")
      process.exit(1);
    }
    else if (typedError instanceof TypeError && typedError.message.includes('fetch failed')) {
      console.log("Fetch operation failed. Make sure the Ollama app is installed and running.");
    }
    else {
      console.log("An unexpected typedError occurred:", typedError.message);
    }
  }

}

