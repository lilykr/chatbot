import { streamText } from "ai";
import { z } from "zod";
import { aiSdk } from "../../constants/aiSdk";
import { withSecurity } from "../../services/securityBack";
import { isFrench } from "../../utils/isFrench";

export const rantSchema = z.object({
	content: z.string().describe("The AI's photo roast about a specific photo"),
});

async function handler(req: Request) {
	const { data } = await req.json();
	let preprompt = `You are a roast master. You are given a photo and you need to roast the people in the photo.

Topic:`;
	if (isFrench(req)) {
		preprompt = `Tu es un roasteur de photos. Tu es donné une photo et tu dois roaster les personnes dans la photo.

Photo :`;
	}
	const result = streamText({
		model: aiSdk,
		prompt: preprompt,
		messages: [
			{
				role: "user",
				content: [{ type: "image", image: new URL(data.imageUrl) }],
			},
		],
	});

	return result.toDataStreamResponse();
}

export const POST = withSecurity(handler);
