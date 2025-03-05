import type { IMessage as DefaultIMessage } from "react-native-gifted-chat";

export interface IMessage extends DefaultIMessage {
  mutipleChoices?: {
    options: {
      id: string;
      label: string;
    }[];
  };
  multipleChoicesAnswer?: {
    id: string;
    label: string;
    multipleChoicesMessageId: string | number;
  }
}

