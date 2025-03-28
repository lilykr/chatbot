import { streamObject } from "ai";
import { z } from "zod";
import { aiSdk } from "../../constants/aiSdk";
import { withSecurity } from "../../services/securityBack";
import { isFrench } from "../../utils/isFrench";

export const titleSchema = z.object({
	title: z
		.string()
		.max(40)
		.describe("A concise, descriptive title for the chat conversation"),
});

async function handler(req: Request) {
	const { messages } = await req.json();

	let preprompt = `Génère un titre concis, drôle ou sarcastique pour cette conversation.
Le titre doit être percutant, peut inclure des émojis, lâche-toi.
Maximum 40 caractères.

Contexte du chat :`;

	if (isFrench(req)) {
		preprompt = `Génère un titre concis, drôle ou sarcastique pour cette conversation.
Le titre doit être percutant, peut inclure des émojis, lâche-toi.
Maximum 40 caractères.

Contexte du chat :`;
	}
	const result = streamObject({
		model: aiSdk,
		schema: titleSchema,
		prompt: `${preprompt}
${JSON.stringify(messages)}`,
	});

	return result.toTextStreamResponse({
		headers: {
			"Content-Type": "text/event-stream",
		},
	});
}

export const POST = withSecurity(handler);
