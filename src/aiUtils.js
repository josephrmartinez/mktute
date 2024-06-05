import OpenAI from 'openai';

export default async function getAiResponse(gitDiff, topic) {
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
          content: `Generate a programming tutorial on the following topic ${topic}\n\nThis tutorial should be based entirely on the following git diffs:\n\n${gitDiff}\n\nBe sure to compare the original code with the updated code and to discuss the underlying concepts. Explain WHY the code update was made. If the updated code contains corrections, explain what was wrong with the original code and why these corrections are effective. When it is appropriate, break the diffs into multiple steps to accomplish the tutorial topic.`,
        },
      ],
    });

    return response;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    throw error;
  }
}