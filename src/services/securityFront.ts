import CryptoJS from "crypto-js";
import { fetch as expoFetch } from "expo/fetch";
import { Platform } from "react-native";
import { apiUrl } from "../constants/apiUrl";

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

// Store time offset between server and device
let serverTimeOffset = 0;

/**
 * Get the current time adjusted for server time
 */
const getAdjustedTime = (): number => {
	return Math.floor((Date.now() + serverTimeOffset) / 1000);
};

/**
 * Generate a time-based secret token
 */
export const generateSecretToken = (): string => {
	const interval = Math.floor(getAdjustedTime() / INTERVAL_LENGTH);
	const baseString = `${interval}${STATIC_SECRET_KEY}`;
	return CryptoJS.HmacSHA256(baseString, STATIC_SECRET_KEY).toString();
};

/**
 * Sync time with server
 */
export const syncServerTime = async (): Promise<void> => {
	try {
		const response = await expoFetch(`${apiUrl}/api/server-time`);
		const { serverTime } = await response.json();
		serverTimeOffset = serverTime - Date.now();
		console.log("Time synced with server, offset:", serverTimeOffset);
	} catch (error) {
		console.error("Failed to sync server time:", error);
	}
};

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = (): Record<string, string> => {
	return {
		"x-app-secret": generateSecretToken(),
		"x-platform": Platform.OS,
	};
};

/**
 * Secure fetch wrapper that includes security headers
 */
export const secureFetch = (async (
	endpoint: string,
	options: RequestInit = {},
): Promise<Response> => {
	const url = endpoint.startsWith("http") ? endpoint : `${apiUrl}${endpoint}`;

	// Add security headers to the request
	const headers = {
		...options.headers,
		...getAuthHeaders(),
	};

	// Explicitly handle the body to avoid the RequestInit type issue
	const fetchOptions = {
		...options,
		headers,
		body: options.body || undefined,
	} as Parameters<typeof expoFetch>[1];

	const response = (await expoFetch(url, fetchOptions)) as unknown as Response;

	// If we get a clock drift error, sync the time and retry
	if (response.status === 409) {
		const data = await response.json();
		if (data.code === "CLOCK_DRIFT") {
			console.warn("Clock drift detected, syncing with server...");
			await syncServerTime();

			// Retry the request with updated time
			return secureFetch(endpoint, options);
		}
	}

	return response;
}) as unknown as typeof globalThis.fetch;

// Initialize time sync on module import
syncServerTime();

// Setup periodic time sync (every 60 seconds)
setInterval(syncServerTime, 60 * 1000);
