import { Platform } from "react-native";
import type { Reply } from "react-native-gifted-chat";
import { AVATAR_URL, AVATAR_USER } from "../data/mockedMessages";
import type { IMessage } from "../types/chat";

const friendly = require("../../../../assets/friendly.png");
const creative = require("../../../../assets/creative.png");
const formal = require("../../../../assets/formal.png");

// Use Platform.select for all image URLs
export const FRIENDLY_URL = Platform.select({
	web: "/assets/friendly.png",
	default: friendly,
});

export const CREATIVE_URL = Platform.select({
	web: "/assets/creative.png",
	default: creative,
});

export const FORMAL_URL = Platform.select({
	web: "/assets/formal.png",
	default: formal,
});

export const getPersonalitySelectionMessage = (): IMessage => ({
	_id: Math.round(Math.random() * 1000000),
	text: `C'est noté. Maintenant choisissez ma personnalité:`,
	createdAt: new Date(),
	user: {
		_id: 2,
		name: "Assistant Personnel",
		avatar: AVATAR_URL,
	},
	quickReplies: {
		type: "carousel",
		values: [
			{
				value: "formelle",
				title: "Formelle",
				description:
					"Une assistante personnelle, toujours prête à vous aider avec discrétion et efficacité.",
				image: FORMAL_URL,
				caption: "Professionnelle et efficace",
			},
			{
				value: "conviviale",
				title: "Conviviale",
				description:
					"Une amie bienveillante qui vous accompagne dans vos souvenirs avec enthousiasme.",
				image: FRIENDLY_URL,
				caption: "Chaleureuse et amicale",
			},
			{
				value: "creative",
				title: "Créative",
				description:
					"Une artiste dans l'âme qui apporte une touche d'originalité à vos souvenirs.",
				image: CREATIVE_URL,
				caption: "Inspirante et originale",
			},
		],
	},
});

const getVideoPromptMessage = (personality: string): IMessage => {
	const videoPrompts = {
		formelle:
			"Je vous invite à enregistrer votre première vidéo. Appuyez sur l'icône de caméra ci-dessous pour commencer l'enregistrement.",
		conviviale:
			"On commence l'aventure ? 🎥 Enregistre ta première vidéo en cliquant sur la petite caméra en bas ! Ce sera super de découvrir ton premier souvenir ! 😊",
		creative:
			"Capturons votre premier moment magique ensemble ! ✨ Laissez votre créativité s'exprimer en enregistrant votre première vidéo avec l'icône caméra ci-dessous 🎬",
	};

	return {
		_id: Math.round(Math.random() * 1000000),
		text:
			videoPrompts[personality as keyof typeof videoPrompts] ||
			"Enregistrez votre première vidéo.",
		createdAt: new Date(),
		user: {
			_id: 2,
			name: "Assistant Personnel",
			avatar: AVATAR_URL,
		},
	};
};

export const handleQuickReply = (
	reply: Reply,
): {
	userMessage: IMessage;
	shouldShowPersonalitySelection: boolean;
	botResponse?: IMessage | undefined;
	followUpMessage?: IMessage | undefined;
} => {
	const userMessage: IMessage = {
		_id: Math.round(Math.random() * 1000000),
		text: reply.title,
		createdAt: new Date(),
		user: {
			_id: 1,
			avatar: AVATAR_USER,
		},
	};

	const isGenderSelection =
		reply.value === "feminine" || reply.value === "masculine";

	let botResponse: IMessage | undefined;
	let followUpMessage: IMessage | undefined;

	if (!isGenderSelection) {
		const personalityResponses = {
			formelle:
				"Parfait, je serai votre assistante professionnelle. Je m'efforcerai de vous aider avec la plus grande efficacité et discrétion.",
			conviviale:
				"Super choix ! Je suis ravie d'être votre amie bienveillante. On va passer de supers moments ensemble à explorer vos souvenirs ! 😊",
			creative:
				"Magnifique ! Laissez-moi être votre muse créative. Ensemble, nous transformerons vos souvenirs en véritables œuvres d'art ! ✨",
		};

		botResponse = {
			_id: Math.round(Math.random() * 1000000),
			text:
				personalityResponses[
					reply.value as keyof typeof personalityResponses
				] || "Je suis prête à vous aider.",
			createdAt: new Date(),
			user: {
				_id: 2,
				name: "Assistant Personnel",
				avatar: AVATAR_URL,
			},
		};

		followUpMessage = getVideoPromptMessage(reply.value);
	}

	return {
		userMessage,
		shouldShowPersonalitySelection: isGenderSelection,
		botResponse,
		followUpMessage,
	};
};
