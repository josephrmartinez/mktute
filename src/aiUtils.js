import OpenAI from 'openai';

export async function getAiResponse(gitDiff, topic) {
  const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY })

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that generates tutorials from git diffs. Format your response in valid markdown. The tutorial should include code examples devired solely from the provided diffs.',
        },
        {
          role: 'user',
          content: `Generate a programming tutorial on the following topic ${topic}\n\nThis tutorial should be based entirely on the following git diffs:\n\n${gitDiff}\n\nBe sure to compare the original code with the updated code and to discuss the underlying concepts. Start the tutorial by helping the user understand the initial state of the code. Identify the problem that the changes address. Explain WHY the code update was made. If the updated code contains corrections, explain what was wrong with the original code and why these corrections are effective. If the updated code indicates that the user created or deleted a file, explain why this was necessary. When it is appropriate, break the diffs into multiple steps to accomplish the tutorial topic. Do not mention the term "diff" in your response. You are just taking in these diffs as reference material. Your job is to use this material to explain to the user the topic of the tutorial in a logical, step-by-step manner.`,
        },
      ],
    });

    return response;
  } catch (error) {
    throw error
  }
}

export function estimateCost(gitDiff) {
  const combinedInput = gitDiff; // update later to include other context inputs
  const inputLength = combinedInput.length;
  // Assume 1 token ~= 4 chars in English
  const inputTokens = inputLength / 4;
  
  // Assume fixed output size of 1000 tokens
  const outputTokens = 1000;

  const cost = (inputTokens / 1000 * 0.01) + (outputTokens / 1000 * 0.03) // gpt-4-turbo pricing
  return cost;

}