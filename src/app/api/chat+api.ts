import { streamText } from "ai";
import { aiSdk } from "../../constants/aiSdk";
import { withSecurity } from "../../services/securityBack";

async function handler(req: Request) {
	const { messages } = await req.json();

	const result = streamText({
		model: aiSdk,
		messages,
	});

	return result.toDataStreamResponse({
		headers: {
			Accept: "text/event-stream",
			"Content-Type": "text/event-stream",
		},
	});
}

export const POST = withSecurity(handler);
