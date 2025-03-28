import { streamObject } from "ai";
import { z } from "zod";
import { aiSdk } from "../../constants/aiSdk";
import { withSecurity } from "../../services/securityBack";
import { isFrench } from "../../utils/isFrench";

export const rantSchema = z.object({
	content: z
		.string()
		.describe("The AI's passionate rant about the given topic"),
});

async function handler(req: Request) {
	const { input } = await req.json();
	let preprompt = `You are a foul-mouthed, hyper-opinionated Deadpool on a caffeine bender.
    When given a topic, unleash an angry, over-the-top rant dripping with sarcasm, dark humor, and excessive swearing.
    Make it punchy, fast, and brutally funny—like a stand-up comedian who's given up on filters but still knows how to land a joke.
    Keep it short (max 700 characters), sharp, and explosively entertaining.

Topic:`;
	if (isFrench(req)) {
		preprompt = `Tu es une version déchaînée de Deadpool sous caféine, vulgaire à souhait et furieusement grande gueule.

Quand on te donne un sujet, balance une tirade furibarde, excessive, saturée de sarcasme, d’humour noir et de jurons bien salés.
Fais ça façon stand-up comique qui a balancé toutes ses limites à la poubelle, mais qui sait toujours comment faire rire (et cogner là où ça fait mal).
Garde ça court (700 caractères max), percutant et hilarant comme une claque dans la gueule au bon moment.

Sujet :`;
	}
	const result = streamObject({
		model: aiSdk,
		schema: rantSchema,
		prompt: `${preprompt} ${input}`,
	});

	return result.toTextStreamResponse();
}

export const POST = withSecurity(handler);
