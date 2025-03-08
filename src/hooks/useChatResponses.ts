import type { Reply } from "react-native-gifted-chat";
import { AVATAR_URL, AVATAR_USER } from "../data/mockedMessages";
import type { IMessage } from "../types/chat";

export const useChatResponses = () => {
	const getPersonalitySelectionMessage = (): IMessage => ({
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
					image:
						"https://images.unsplash.com/photo-1491336477066-31156b5e4f35?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
					caption: "Professionnelle et efficace",
				},
				{
					value: "conviviale",
					title: "Conviviale",
					description:
						"Une amie bienveillante qui vous accompagne dans vos souvenirs avec enthousiasme.",
					image:
						"https://images.unsplash.com/photo-1586011978320-228b9817faf1?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
					caption: "Chaleureuse et amicale",
				},
				{
					value: "creative",
					title: "Créative",
					description:
						"Une artiste dans l'âme qui apporte une touche d'originalité à vos souvenirs.",
					image:
						"https://plus.unsplash.com/premium_photo-1681488007344-c75b0cf8b0cd?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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

	const handleQuickReply = (
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

	return {
		getPersonalitySelectionMessage,
		handleQuickReply,
	};
};
