import type { IMessage } from "../types/chat";

// extracted from GiftedChat.append
export const appendToChat = (
	currentMessages: IMessage[],
	messages: IMessage[],
	inverted = true,
) => {
	const messageArray = Array.isArray(messages) ? messages : [messages];
	return inverted
		? messageArray.concat(currentMessages)
		: currentMessages.concat(messageArray);
};
