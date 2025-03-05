import type { IMessage } from "../types/chat";

export const mockedMessages: IMessage[] = [
  {
    _id: 5,
    text: "D'abord, choisissez mon genre :",
    createdAt: new Date("2024-05-27T09:41:04"),
    user: {
      _id: 2,
      name: "Assistant Personnel",
      avatar: "🤖"
    },
    mutipleChoices: {
      options: [
        { id: "feminine", label: "Féminin" },
        { id: "masculine", label: "Masculin" },
        { id: "neutral", label: "Neutre" }
      ]
    }
  },
  {
    _id: 4,
    text: "Que voulez-vous faire ?",
    createdAt: new Date("2024-05-27T09:41:03"),
    user: {
      _id: 2,
      name: "Assistant Personnel",
      avatar: "🤖"
    },
    mutipleChoices: {
      options: [
        { id: "personalize", label: "Personnaliser" },
        { id: "default", label: "Garder l'assistant par défaut" }
      ]
    }
  },
  {
    _id: 3,
    text: "Vous pouvez choisir ma personnalité, ce qui me permettra de vous aider au mieux tout en rendant votre expérience authentique et agréable.",
    createdAt: new Date("2024-05-27T09:41:02"),
    user: {
      _id: 2,
      name: "Assistant Personnel",
      avatar: "🤖"
    }
  },
  {
    _id: 2,
    text: "Je serai votre assistant personnel. Mon rôle est de vous aider à collecter et organiser vos souvenirs comme jamais auparavant.",
    createdAt: new Date("2024-05-27T09:41:01"),
    user: {
      _id: 2,
      name: "Assistant Personnel",
      avatar: "🤖"
    }
  },
  {
    _id: 1,
    text: "Bonjour [Prénom] ! Bravo ! Votre compte a bien été créé.",
    createdAt: new Date("2024-05-27T09:41:00"),
    user: {
      _id: 2,
      name: "Assistant Personnel",
      avatar: "🤖"
    }
  }
];