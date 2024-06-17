import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import ollama from 'ollama';

function assertIsTextBlock(value: unknown): asserts value is Anthropic.TextBlock {
  if (typeof value === "object" && value && value.hasOwnProperty("text")) throw new Error('Expected text block');
}

const systemMessage = 'You are an expert at reading and understanding git diffs. Given a set of diffs, you will generate a programming tutorial that explains a concept and walks someone through how to address the problem(s) just like the diffs demonstrate. Format your response in valid markdown. The tutorial should include code examples devired solely from the provided diffs.';

/**
 * Get the user message to send to the AI model
 * @param topic - The topic of the tutorial
 * @param gitDiff - The git diff to generate the tutorial from
 */
function getUserMessage(topic: string, gitDiff: string) {
  return `Generate a programming tutorial on the following topic: ${topic}.\n\n /// This tutorial should be based entirely on the following git diffs:\n\n${gitDiff}\n\n /// Be sure to compare the original code with the updated code and to discuss the underlying concepts. Start the tutorial by helping the user understand the initial state of the code. Identify the problem that the changes address. Explain WHY the code update was made. If the updated code contains corrections, explain what was wrong with the original code and why these corrections are effective. If the updated code indicates that the user created or deleted a file, explain why this was necessary. When it is appropriate, break the diffs into multiple steps to accomplish the tutorial topic. Do not mention the term "diff" in your response and DO NOT include the actual diffs. You are just taking in these diffs as reference material to understand what changes were made. Your job is to use this material to explain to the user the topic of the tutorial in a logical, step-by-step manner that is consistent with how the diffs show the actual code was changed.`;
}


export async function getOpenAIResponse(gitDiff: string, topic: string) {
  const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: getUserMessage(topic, gitDiff),
      },
    ],
  });

  if (!response.usage) {
    throw new Error('Usage not found in response');
  }

  const inputTokens = response.usage.prompt_tokens
  const outputTokens = response.usage.completion_tokens
  const cost = ((inputTokens / 1000 * 0.01) + (outputTokens / 1000 * 0.03)).toFixed(3) // gpt-4-turbo

  const tutorial = response.choices[0].message.content

  return {cost, tutorial};
}

export async function getAnthropicResponse(gitDiff: string, topic: string) {
  const anthropic = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY})

  const msg = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 3000,
    system: systemMessage,
    messages: [
      {
        role: 'user',
        content: getUserMessage(topic, gitDiff),
      },
    ],
  });

  const inputTokens = msg.usage.input_tokens
  const outputTokens = msg.usage.output_tokens
  // const cost = ((inputTokens / 1000 * 0.015) + (outputTokens / 1000 * 0.075)).toFixed(3) //claude-3-opus-20240229
  const cost = ((inputTokens / 1000 * 0.003) + (outputTokens / 1000 * 0.015)).toFixed(3) //claude-3-sonnet-20240229
  // const cost = ((inputTokens / 1000 * 0.00025) + (outputTokens / 1000 * 0.00125)).toFixed(3) //claude-3-haiku-20240307

  assertIsTextBlock(msg.content[0]);
  const tutorial = msg.content[0].text;

  return {cost, tutorial};
}


export async function getOllamaResponse(gitDiff: string, topic: string) {
  try {
    const response = await ollama.chat({
      model: 'llama3',
      stream: true,
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: getUserMessage(topic, gitDiff),
        },
      ],
    });

    let tutorialContent = '';

    for await (const part of response) {
      process.stdout.write(part.message.content)
      tutorialContent += part.message.content;
    }

    const cost = 0.000

    return {cost, tutorial: tutorialContent};
  } catch (error) {
    throw error
  }
}


export function estimateCost(gitDiff: string) {
  const combinedInput = gitDiff; // update later to include other context inputs
  const inputLength = combinedInput.length;
  // Assume 1 token ~= 4 chars in English
  const inputTokens = inputLength / 4;

  // Assume fixed output size of 2000 tokens
  const outputTokens = 2000;

  const openAI = ((inputTokens / 1000 * 0.01) + (outputTokens / 1000 * 0.03)).toFixed(3) // gpt-4-turbo pricing

  //const anthropic = ((inputTokens / 1000 * 0.015) + (outputTokens / 1000 * 0.075)).toFixed(3) //claude-3-opus-20240229
  const anthropic = ((inputTokens / 1000 * 0.003) + (outputTokens / 1000 * 0.015)).toFixed(3) //claude-3-sonnet-20240229
  // const anthropic =((inputTokens / 1000 * 0.00025) + (outputTokens / 1000 * 0.00125)).toFixed(3) //claude-3-haiku-20240307

  return {openAI, anthropic};
}

