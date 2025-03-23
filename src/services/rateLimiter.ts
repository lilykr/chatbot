import getFirebaseAdmin from "./firebase";

export interface RateLimitOptions {
	// Maximum number of requests in the time window
	maxRequests: number;
	// Time window in seconds
	windowSizeInSeconds: number;
	// Unique identifier for the user/IP
	identifier: string;
	// Optional namespace to separate different rate limits
	namespace?: string;
}

interface RequestData {
	timestamp: number;
}

interface RateLimitData {
	requests: RequestData[];
	lastRequest: number;
}

/**
 * Extracts the device ID from request headers
 * @param req The request object
 * @returns The device ID or 'unknown-device' if not found
 */
function extractDeviceId(req: Request): string {
	const deviceId = req.headers.get("x-device-id");
	if (deviceId) {
		return deviceId.trim();
	}

	// Fallback
	return "unknown-device";
}

/**
 * Check if a request is rate limited
 * @returns An object indicating if the request is allowed and time remaining if rate limited
 */
export async function checkRateLimit({
	maxRequests,
	windowSizeInSeconds,
	identifier,
	namespace = "default",
}: RateLimitOptions): Promise<{ allowed: boolean; timeLeftMs?: number }> {
	const db = getFirebaseAdmin();
	const now = Date.now();
	const windowStart = now - windowSizeInSeconds * 1000;

	// Reference to the rate limit data for this identifier and namespace
	const rateLimitRef = db.ref(`rateLimits/${namespace}/${identifier}`);

	try {
		// Transaction to update the request count atomically
		const result = await rateLimitRef.transaction(
			(currentData: RateLimitData | null) => {
				// Initialize if no data exists
				if (!currentData) {
					return {
						requests: [
							{
								timestamp: now,
							},
						],
						lastRequest: now,
					};
				}

				// Filter out requests outside the current time window
				const requests = (currentData.requests || []).filter(
					(req: RequestData) => req.timestamp > windowStart,
				);

				// Add the current request
				requests.push({
					timestamp: now,
				});

				return {
					requests,
					lastRequest: now,
				};
			},
		);

		// If transaction was successful, check if rate limit exceeded
		if (result.committed) {
			const snapshot = result.snapshot.val();
			const isAllowed = snapshot.requests.length <= maxRequests;

			if (!isAllowed) {
				// Find the oldest request in the current window
				const oldestRequest = snapshot.requests
					.map((req: RequestData) => req.timestamp)
					.sort((a: number, b: number) => a - b)[0];

				// Calculate time until oldest request falls out of the window
				const timeLeftMs = oldestRequest + windowSizeInSeconds * 1000 - now;

				return { allowed: false, timeLeftMs };
			}

			return { allowed: true };
		}

		return { allowed: false };
	} catch (error) {
		console.error("Rate limiting error:", error);
		// If there's an error with rate limiting, default to allowing the request
		// You might want to change this behavior based on your requirements
		return { allowed: true };
	}
}

/**
 * Middleware wrapper for device-based rate limiting
 */
export function withRateLimit(
	handler: (req: Request) => Promise<Response>,
	options: Omit<RateLimitOptions, "identifier">,
) {
	return async (req: Request) => {
		// Get device ID for rate limiting
		const deviceId = extractDeviceId(req);

		// Reject requests with unknown device IDs
		if (deviceId === "unknown-device") {
			return new Response(
				JSON.stringify({
					error: "Device verification failed",
					message:
						"Unable to determine device ID. Please include x-device-id header.",
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		const result = await checkRateLimit({
			...options,
			identifier: deviceId,
		});

		if (!result.allowed) {
			const timeLeftSec = result.timeLeftMs
				? Math.ceil(result.timeLeftMs / 1000)
				: options.windowSizeInSeconds;
			const timeLeftMin = Math.ceil(timeLeftSec / 60);

			return new Response(
				JSON.stringify({
					error: "Rate limit exceeded",
					message: `Too many requests from this device. Please try again in ${timeLeftMin} minutes.`,
					timeLeft: {
						seconds: timeLeftSec,
						minutes: timeLeftMin,
					},
				}),
				{
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": timeLeftSec.toString(),
					},
				},
			);
		}

		return handler(req);
	};
}
