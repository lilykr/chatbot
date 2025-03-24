import { ElevenLabsClient } from "elevenlabs";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
	throw new Error("Missing ELEVENLABS_API_KEY in environment variables");
}

const client = new ElevenLabsClient({
	apiKey: ELEVENLABS_API_KEY,
});

export const createAudioStreamFromText = async (
	text: string,
): Promise<Buffer> => {
	const audioStream = await client.textToSpeech.convertAsStream(
		"JBFqnCBsd6RMkjVDRZzb",
		{
			model_id: "eleven_multilingual_v2",
			text,
			output_format: "mp3_44100_128",
			// Optional voice settings that allow you to customize the output
			voice_settings: {
				stability: 0,
				similarity_boost: 1.0,
				use_speaker_boost: true,
				speed: 1.0,
			},
		},
	);

	const chunks: Buffer[] = [];
	for await (const chunk of audioStream) {
		chunks.push(chunk);
	}

	const content = Buffer.concat(chunks);
	return content;
};
