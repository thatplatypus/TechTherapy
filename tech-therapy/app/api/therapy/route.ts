import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt: { tech, mode } } = await req.json();

  const prompts = {
    affirmations: `Create 3-5 short, powerful affirmations for a developer frustrated with ${tech}. 
                   Make them empowering and supportive, similar to: "pods crash, but you don't" or 
                   "you are the orchestrator of your own destiny". 
                   Format them as a numbered list, one affirmation per line.
                   Keep each one concise and impactful.`,
    encouragement: `Create an encouraging, motivational message for a developer struggling with ${tech}. 
                    Focus on their potential to overcome the challenge and grow from it. 
                    Keep it authentic and energizing.`,
    roast: `Create a humorous, playful roast about ${tech} that a frustrated developer would appreciate. 
            Include technical jokes and wordplay. Keep it light and fun, not mean-spirited.`
  };

  const promptText = prompts[mode as keyof typeof prompts];
  if (!promptText) {
    return new Response('Invalid mode', { status: 400 });
  }

  const result = streamText({
    model: openai('gpt-4'),
    system: 'You are an empathetic tech therapist who specializes in supporting developers through their technical frustrations.',
    prompt: promptText,
  });

  return result.toDataStreamResponse();
} 