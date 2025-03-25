import { AwsClient } from "aws4fetch";

// Environment variables remain the same
const {
	AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY,
	AWS_REGION_NAME,
	AWS_S3_BUCKET_NAME,
} = process.env;

if (
	!AWS_ACCESS_KEY_ID ||
	!AWS_SECRET_ACCESS_KEY ||
	!AWS_REGION_NAME ||
	!AWS_S3_BUCKET_NAME
) {
	throw new Error(
		"One or more environment variables are not set. Please check your .env file.",
	);
}

// Initialize aws4fetch client
const client = new AwsClient({
	accessKeyId: AWS_ACCESS_KEY_ID,
	secretAccessKey: AWS_SECRET_ACCESS_KEY,
	service: "s3",
	region: AWS_REGION_NAME,
});

// Base URL for S3 operations
const baseUrl = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION_NAME}.amazonaws.com`;

export const generatePresignedUrl = async (
	objectKey: string,
): Promise<string> => {
	const url = `${baseUrl}/${encodeURIComponent(objectKey)}?X-Amz-Expires=3600`;
	const signedUrl = await client.sign(new Request(url), {
		aws: { signQuery: true },
	});
	return signedUrl.url.toString();
};

export const uploadAudioStreamToS3 = async (
	audioStream: Buffer,
): Promise<string> => {
	const remotePath = `${Date.now()}.mp3`;
	const response = await client.fetch(`${baseUrl}/${remotePath}`, {
		method: "PUT",
		body: audioStream,
		headers: {
			"Content-Type": "audio/mpeg",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to upload to S3: ${await response.text()}`);
	}

	return remotePath;
};
