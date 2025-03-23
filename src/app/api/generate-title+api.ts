import { streamObject } from "ai";
import { z } from "zod";
import { aiSdk } from "../../constants/aiSdk";
import { withRateLimit } from "../../services/rateLimiter";
import { withSecurity } from "../../services/securityBack";

export const titleSchema = z.object({
	title: z
		.string()
		.max(40)
		.describe("A concise, descriptive title for the chat conversation"),
});

async function handler(req: Request) {
	const { messages } = await req.json();

	const result = streamObject({
		model: aiSdk,
		schema: titleSchema,
		prompt: `Generate a concise, funny or sarcastic title for this chat conversation.
The title should be concise, and use emojis if needed. Go wild !
Maximum 40 characters.

Chat context:
${JSON.stringify(messages)}`,
	});

	return result.toTextStreamResponse({
		headers: {
			"Content-Type": "text/event-stream",
		},
	});
}

export const POST = withSecurity(withRateLimit(handler));
