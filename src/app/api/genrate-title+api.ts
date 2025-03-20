import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

export async function POST(req: Request) {
	const { messages } = await req.json();

	const result = streamText({
		model: openai("gpt-4o"),
		messages: [
			{
				role: "system",
				content: `You are a helpful assistant that generates concise, descriptive titles for chat conversations.
        The title should be:
        1. Short (max 60 characters)
        2. Descriptive of the main topic
        3. Professional and clear
        4. Without special characters or emojis
        Return only the title, nothing else.`,
			},
			...messages,
		],
		tools: {
			generateTitle: {
				description: "Generate a title for the chat conversation",
				parameters: z.object({
					title: z.string().describe("The generated title for the chat"),
				}),
				execute: async ({ title }: { title: string }) => {
					return title;
				},
			},
		},
	});

	return result.toDataStreamResponse();
}
