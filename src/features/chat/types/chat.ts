import type {
	IMessage as DefaultIMessage,
	QuickReplies as DefaultQuickReplies,
	User,
} from "react-native-gifted-chat";

export type IMessage =
	| DefaultIMessage
	| {
			_id: string | number;
			text: string;
			createdAt: Date | number;
			user: User;
			quickReplies: QuickReplies;
	  };

export type CarouselReply = {
	value: string;
	image: string;
	title: string;
	description: string;
	caption: string;
};

export type QuickReplies =
	| DefaultQuickReplies
	| {
			type: "carousel";
			values: CarouselReply[];
			keepIt?: boolean;
	  };
