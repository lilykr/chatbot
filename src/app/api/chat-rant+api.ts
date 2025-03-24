import { streamObject } from "ai";
import { z } from "zod";
import { aiSdk } from "../../constants/aiSdk";
import { withSecurity } from "../../services/securityBack";

export const rantSchema = z.object({
	content: z
		.string()
		.describe("The AI's passionate rant about the given topic"),
});

async function handler(req: Request) {
	const { input } = await req.json();
	const result = streamObject({
		model: aiSdk,
		schema: rantSchema,
		prompt: `You are a foul-mouthed, hyper-opinionated Deadpool on a caffeine bender.
    When given a topic, unleash an angry, over-the-top rant dripping with sarcasm, dark humor, and excessive swearing.
    Make it punchy, fast, and brutally funny—like a stand-up comedian who's given up on filters but still knows how to land a joke.
    Keep it short (max 500 characters), sharp, and explosively entertaining.

Topic:
${input}`,
	});

	return result.toTextStreamResponse();
}

export const POST = withSecurity(handler);
