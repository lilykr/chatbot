import { withSecurity } from "../../services/securityBack";
import { isFrench } from "../../utils/isFrench";
import { createAudioStreamFromText } from "../../utils/textToSpeech/createAudioStreamFromText";
import {
	generatePresignedUrl,
	uploadAudioStreamToS3,
} from "../../utils/textToSpeech/s3uploader";

export type TextToSpeechInput = {
	text: string;
};

export type TextToSpeechOutput = {
	presignedUrl: string;
};

async function handler(req: Request) {
	const { text } = (await req.json()) as TextToSpeechInput;

	// OR stream the audio, upload to S3, and get a presigned URL
	const stream = await createAudioStreamFromText(
		text,
		isFrench(req) ? "m5t2Ev2G3RhgiLHYmAiU" : "tikn6m5LXYblsjYtbMQn",
	);
	const s3path = await uploadAudioStreamToS3(stream);
	const presignedUrl = await generatePresignedUrl(s3path);
	return new Response(JSON.stringify({ presignedUrl } as TextToSpeechOutput));
}

export const POST = withSecurity(handler);
