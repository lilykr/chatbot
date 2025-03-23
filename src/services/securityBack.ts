import crypto from "node:crypto";

// Check for required environment variables
if (!process.env.EXPO_PUBLIC_API_SECRET_KEY) {
	throw new Error(
		"EXPO_PUBLIC_API_SECRET_KEY environment variable is required",
	);
}

const STATIC_SECRET_KEY = process.env.EXPO_PUBLIC_API_SECRET_KEY;
const INTERVAL_LENGTH = process.env.EXPO_PUBLIC_TOKEN_INTERVAL
	? Number(process.env.EXPO_PUBLIC_TOKEN_INTERVAL)
	: 10;
const ALLOWED_TOLERANCE = 2;

/**
 * Generate the expected token for a given time interval
 */
export function generateExpectedToken(interval: number): string {
	const baseString = `${interval}${STATIC_SECRET_KEY}`;
	return crypto
		.createHmac("sha256", STATIC_SECRET_KEY)
		.update(baseString)
		.digest("hex");
}

/**
 * Verify the provided token against expected values
 */
export function verifyToken(
	token: string,
	currentTime: number,
): {
	valid: boolean;
	clockDrift?: boolean;
} {
	const currentInterval = Math.floor(currentTime / INTERVAL_LENGTH);

	// Check current interval and intervals within tolerance
	for (let i = -ALLOWED_TOLERANCE; i <= ALLOWED_TOLERANCE; i++) {
		const interval = currentInterval + i;
		const expectedToken = generateExpectedToken(interval);

		if (token === expectedToken) {
			return {
				valid: true,
				// If not current interval, flag clock drift
				clockDrift: i !== 0,
			};
		}
	}

	return { valid: false };
}

type ErrorResponse = {
	error: string;
	code: string;
	status: number;
};

/**
 * Check app secret and version in the request headers
 * Returns null if valid, or an error response object if invalid
 */
export function checkAppSecret(headers: Headers): ErrorResponse | null {
	const appSecret = headers.get("x-app-secret");

	// Verify app secret
	if (!appSecret) {
		return {
			error: "Unauthorized",
			code: "MISSING_APP_SECRET",
			status: 401,
		};
	}

	const currentTime = Math.floor(Date.now() / 1000);
	const { valid, clockDrift } = verifyToken(appSecret, currentTime);

	if (!valid) {
		return {
			error: "Unauthorized",
			code: "INVALID_APP_SECRET",
			status: 401,
		};
	}

	// Return warning about clock drift
	if (clockDrift) {
		return {
			error: "Client clock drift detected",
			code: "CLOCK_DRIFT",
			status: 409,
		};
	}

	return null; // Valid
}

/**
 * Higher-order function to wrap API handlers with security check
 * @param handler The API route handler function
 * @param options Configuration options
 * @returns A wrapped handler with security checks
 */
export function withSecurity(
	handler: (req: Request) => Promise<Response>,
	options: {
		skipSecurityCheck?: boolean;
	} = {},
) {
	return async (req: Request): Promise<Response> => {
		// Skip security check if specified in options
		if (options.skipSecurityCheck) {
			return handler(req);
		}

		// Verify app authentication
		const securityCheck = checkAppSecret(req.headers);
		if (securityCheck) {
			return new Response(
				JSON.stringify({
					error: securityCheck.error,
					code: securityCheck.code,
				}),
				{
					status: securityCheck.status,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		// If security check passes, call the original handler
		return handler(req);
	};
}
