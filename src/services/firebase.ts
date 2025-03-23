import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

// Initialize Firebase Admin SDK if not already initialized
function getFirebaseAdmin() {
	if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
		throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
	}

	if (!process.env.FIREBASE_DATABASE_URL) {
		throw new Error("FIREBASE_DATABASE_URL is not set");
	}

	if (getApps().length === 0) {
		// In a production environment, you'd use environment variables
		const serviceAccount = JSON.parse(
			process.env.FIREBASE_SERVICE_ACCOUNT_KEY!,
		);

		// Fix the private key format by replacing escaped newlines with actual newlines
		if (serviceAccount.private_key) {
			serviceAccount.private_key = serviceAccount.private_key.replace(
				/\\n/g,
				"\n",
			);
		}

		initializeApp({
			credential: cert(serviceAccount),
			databaseURL: process.env.FIREBASE_DATABASE_URL!,
		});
	}

	return getDatabase();
}

export default getFirebaseAdmin;
