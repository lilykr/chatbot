import type { IMessage } from "../types/chat";

export const AVATAR_URL =
	"https://plus.unsplash.com/premium_photo-1681943258709-9137146aa2bf?q=80&w=2884&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const AVATAR_USER =
	"https://media.licdn.com/dms/image/v2/C5603AQGUmxHYqgbv2Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1516267491614?e=1746662400&v=beta&t=Lnb3HpfKwA5PlxrWX28h-kbsm7dfh4TFwz7U7zh28bQ";

export const mockedMessages: IMessage[] = [
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
			],
		},
	},
	{
		_id: 4,
		text: "Vous pouvez choisir ma personnalité, ce qui me permettra de vous aider au mieux tout en rendant votre expérience authentique et agréable.",
		createdAt: new Date("2024-05-27T09:41:02"),
		user: {
			_id: 2,
			name: "Assistant Personnel",
			avatar: AVATAR_URL,
		},
	},
	{
		_id: 3,
		text: "Ok, c'est noté Benny !",
		createdAt: new Date("2024-05-27T09:41:01"),
		user: {
			_id: 2,
			name: "Assistant Personnel",
			avatar: AVATAR_URL,
		},
	},
	{
		_id: 2,
		text: "Benny",
		createdAt: new Date("2024-05-27T09:42:00"),
		user: {
			_id: 1,
			avatar: AVATAR_USER,
		},
	},
	{
		_id: 1,
		text: "Bonjour ! Je suis Lily, votre assistant personnel de souvenirs. Comment dois-je vous appeler ?",
		createdAt: new Date("2024-05-27T09:41:00"),
		user: {
			_id: 2,
			name: "Assistant Personnel",
			avatar: AVATAR_URL,
		},
	},
];
