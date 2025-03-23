import { withSecurity } from "../../services/securityBack";

async function handler() {
	return new Response(
		JSON.stringify({
			serverTime: Date.now(),
		}),
		{
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
}

export const GET = withSecurity(handler, { skipSecurityCheck: true });
