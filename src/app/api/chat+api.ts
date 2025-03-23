import { streamText } from "ai";
import { aiSdk } from "../../constants/aiSdk";
import { withRateLimit } from "../../services/rateLimiter";
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

// Apply IP-based rate limiting: 10 requests per minute (60 seconds) per IP address
const rateLimitedHandler = withRateLimit(handler, {
	maxRequests: 40,
	windowSizeInSeconds: 43200, // 12 hours
});

export const POST = withSecurity(rateLimitedHandler);
