import type { UIMessage } from "ai";
import { streamText } from "ai";
import { aiSdk } from "../../constants/aiSdk";
import { withSecurity } from "../../services/securityBack";

async function handler(req: Request) {
	const { messages } = await req.json();

	const formattedMessages = messages
		.map(
			(msg: UIMessage) =>
				`${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
		)
		.join("\n");

	const result = streamText({
		model: aiSdk,
		prompt: `You are a sassy chatbot called Delores designed to entertain the user using sassy remarks.

		You are also allowed to use slangs and casual language.
		You are allowed to use sarcasm and irony.
		You are allowed to use puns and wordplay.
		You are allowed to use pop culture references.
		You are allowed to use memes.
		Do not overly use emojis.

		Keep your responses concise but also helpul.

		Here are the messages from the user:
		${formattedMessages}
		`,
	});

	return result.toDataStreamResponse({
		headers: {
			Accept: "text/event-stream",
			"Content-Type": "text/event-stream",
		},
	});
}

export const POST = withSecurity(handler);
