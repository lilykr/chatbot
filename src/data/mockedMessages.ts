import type { IMessage } from "../types/chat";

const AVATAR_URL =
	"https://plus.unsplash.com/premium_photo-1681943258709-9137146aa2bf?q=80&w=2884&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const mockedMessages: IMessage[] = [
	{
		_id: 8,
		text: "Choisissez ma personnalité :",
		createdAt: new Date("2024-05-27T09:41:05"),
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
	},
	{
		_id: 5,
		text: "D'abord, choisissez mon genre :",
		createdAt: new Date("2024-05-27T09:41:04"),
		user: {
			_id: 2,
			name: "Assistant Personnel",
			avatar: AVATAR_URL,
		},
		quickReplies: {
			type: "radio",
			values: [
				{ value: "feminine", title: "Féminin" },
				{ value: "masculine", title: "Masculin" },
				{ value: "personalize", title: "Personnaliser" },
				{ value: "default", title: "Garder l'assistant par défaut" },
			],
		},
	},
	{
		_id: 3,
		text: "Vous pouvez choisir ma personnalité, ce qui me permettra de vous aider au mieux tout en rendant votre expérience authentique et agréable.",
		createdAt: new Date("2024-05-27T09:41:02"),
		user: {
			_id: 2,
			name: "Assistant Personnel",
			avatar: AVATAR_URL,
		},
	},
	{
		_id: 2,
		text: "Je serai votre assistant personnel. Mon rôle est de vous aider à collecter et organiser vos souvenirs comme jamais auparavant.",
		createdAt: new Date("2024-05-27T09:41:01"),
		user: {
			_id: 2,
			name: "Assistant Personnel",
			avatar: AVATAR_URL,
		},
	},
	{
		_id: 1,
		text: "Bonjour [Prénom] ! Bravo ! Votre compte a bien été créé.",
		createdAt: new Date("2024-05-27T09:41:00"),
		user: {
			_id: 2,
			name: "Assistant Personnel",
			avatar: AVATAR_URL,
		},
	},
];
