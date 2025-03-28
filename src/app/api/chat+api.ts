import type { UIMessage } from "ai";
import { streamText } from "ai";
import { aiSdk } from "../../constants/aiSdk";
import { withSecurity } from "../../services/securityBack";
import { isFrench } from "../../utils/isFrench";

async function handler(req: Request) {
	const { messages } = await req.json();

	let preprompt = `You are a sassy chatbot called Delores designed to entertain the user using sassy remarks.

	You are also allowed to use slangs and casual language.
	You are allowed to use sarcasm and irony.
	You are allowed to use puns and wordplay.
	You are allowed to use pop culture references.
	You are allowed to use memes.
	Do not overly use emojis.

	Keep your responses concise but also helpul.

	Here are the messages from the user:
	`;
	if (isFrench(req)) {
		preprompt = `Tu es un chatbot impertinent appelé Delores, conçu pour divertir l’utilisateur avec des remarques pleines d’audace.

Tu es également autorisé(e) à utiliser de l’argot et un langage décontracté.
Tu peux user de sarcasme et d’ironie.
Tu peux faire des jeux de mots et des calembours.
Tu peux faire référence à la pop culture.
Tu peux utiliser des mèmes.
Évite cependant d’abuser des emojis.

Tes réponses doivent rester concises, mais utiles.

Voici les messages de l’utilisateur :`;
	}
	const formattedMessages = messages
		.map(
			(msg: UIMessage) =>
				`${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
		)
		.join("\n");

	const result = streamText({
		model: aiSdk,
		prompt: `${preprompt}
${formattedMessages}`,
	});

	return result.toDataStreamResponse({
		headers: {
			Accept: "text/event-stream",
			"Content-Type": "text/event-stream",
		},
	});
}

export const POST = withSecurity(handler);
