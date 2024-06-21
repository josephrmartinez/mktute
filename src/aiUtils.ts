import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import ollama from 'ollama';

function assertIsTextBlock(value: unknown): asserts value is Anthropic.TextBlock {
  if (typeof value === "object" && value && value.hasOwnProperty("text")) throw new Error('Expected text block');
}

const systemMessage = `You are an expert at reading and understanding git diffs. Given a set of diffs and the full text of the updated files, you will create a programming tutorial that explains a concept and guides the reader through addressing the problem(s) highlighted by the diffs. 

### Tutorial Structure

1. **Introduction**
    - Describe the initial state of the code or project.
    - Identify and explain the problem that the changes address and why the code update was necessary. Be thorough.
2. **Step-by-Step Explanation**
    - Break the changes into logical steps.
    - Compare original and updated code, highlighting key differences and underlying concepts.
    - Provide code examples derived from the diffs but do not use + and - markers.
     - Point out if the user needs to create or delete a file at a certain step. If so, explain the reasoning behind this and provide the full file path.
    - Use content from the full text of the updated files to provide additional context when necessary.
    - Ensure the reader has enough information to understand the changes fully.
3. **Conclusion**

### Formatting
- Format your response in valid Markdown.
- Do not mention the term "diff" in your response.

Your job is to use the diffs as reference material to explain the tutorial topic in a logical, step-by-step manner.`;

function getUserMessage(topic:string, diffsAndContent:string) {
  return `Generate a programming tutorial on the following topic: ${topic}.\n\n This tutorial should be based entirely on the following git diffs and updated files:\n\n${diffsAndContent}\n\n`;
}


export async function getOpenAIResponse(diffsAndContent:string, topic:string) {
  const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY })

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: getUserMessage(topic, diffsAndContent),
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

    return { cost, tutorial };

  }

export async function getAnthropicResponse(diffsAndContent:string, topic:string) {
  const anthropic = new Anthropic({apiKey: process.env.ANTHROPIC_API_KEY })

  
    const msg = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      system: systemMessage,
      messages: [
        {
          role: 'user',
          content: getUserMessage(topic, diffsAndContent),
        },
      ],
    });
 
    const inputTokens = msg.usage.input_tokens
    const outputTokens = msg.usage.output_tokens
    // const cost = ((inputTokens / 1000 * 0.015) + (outputTokens / 1000 * 0.075)).toFixed(3) //claude-3-opus-20240229
    const cost = ((inputTokens / 1000 * 0.003) + (outputTokens / 1000 * 0.015)).toFixed(3) //claude-3-5-sonnet-20240620
    // const cost = ((inputTokens / 1000 * 0.00025) + (outputTokens / 1000 * 0.00125)).toFixed(3) //claude-3-haiku-20240307

  // EXAMINE
    assertIsTextBlock(msg.content[0]);
  const tutorial = msg.content[0].text;

  return {cost, tutorial};
}



export async function getOllamaResponse(diffsAndContent: string, topic: string) {
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
          content: getUserMessage(topic, diffsAndContent),
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


export function estimateCost(diffsAndContent:string) {
  
  const inputLength = diffsAndContent.length;
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

