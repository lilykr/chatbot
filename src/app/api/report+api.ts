import { z } from "zod";
import { withSecurity } from "../../services/securityBack";

export type ReportReason = "inappropriate";

export interface ReportPayload {
	messageId: string;
	reason: ReportReason;
	messageContent: string;
	timestamp: number;
}

export const reportSchema = z.object({
	messageId: z.string().describe("The ID of the reported message"),
	reason: z.enum(["inappropriate"]).describe("The reason for reporting"),
	messageContent: z.string().describe("The content of the reported message"),
	timestamp: z.number().describe("When the report was submitted"),
});

async function handler(req: Request) {
	const payload = await req.json();
	const validatedData = reportSchema.parse(payload);

	// Mock successful report submission
	console.log("Report received:", validatedData);

	return new Response(JSON.stringify({ success: true }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export const POST = withSecurity(handler);
