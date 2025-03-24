import { withSecurity } from "../../services/securityBack";

async function handler() {
	console.log("Report received:");

	return new Response(JSON.stringify({ success: true }));
}

export const POST = withSecurity(handler);
