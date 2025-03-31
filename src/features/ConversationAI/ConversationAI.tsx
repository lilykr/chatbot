"use dom";
import { useConversation } from "@11labs/react";
import { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

async function requestMicrophonePermission() {
	try {
		await navigator.mediaDevices.getUserMedia({ audio: true });
		return true;
	} catch (error) {
		console.log(error);
		console.error("Microphone permission denied");
		return false;
	}
}

type Props = {
	agentId: string;
};

export default function ConversationAI({ agentId }: Props) {
	const conversation = useConversation({
		onConnect: () => console.log("Connected"),
		onDisconnect: () => console.log("Disconnected"),
		onMessage: (message) => {
			console.log(message);
		},
		onError: (error) => console.error("Error:", error),
	});
	const startConversation = useCallback(async () => {
		try {
			// Request microphone permission
			const hasPermission = await requestMicrophonePermission();
			if (!hasPermission) {
				alert("No permission");
				return;
			}
			console.log("calling startSession");
			await conversation.startSession({
				agentId,
				dynamicVariables: {
					platform: Platform.OS,
				},
				clientTools: {
					logMessage: async ({ message }) => {
						console.log(message);
					},
				},
			});
		} catch (error) {
			console.error("Failed to start conversation:", error);
		}
	}, [conversation, agentId]);

	const stopConversation = useCallback(async () => {
		await conversation.endSession();
	}, [conversation]);

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>Conversation AI</Text>
			<Pressable
				style={[
					styles.callButton,
					conversation.status === "connected" && styles.callButtonActive,
				]}
				onPress={
					conversation.status === "disconnected"
						? startConversation
						: stopConversation
				}
			>
				<View
					style={[
						styles.buttonInner,
						conversation.status === "connected" && styles.buttonInnerActive,
					]}
				>
					<Text>Start Conversation</Text>
				</View>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	callButton: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 24,
	},
	callButtonActive: {
		backgroundColor: "rgba(239, 68, 68, 0.2)",
	},
	buttonInner: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "#3B82F6",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#3B82F6",
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowOpacity: 0.5,
		shadowRadius: 20,
		elevation: 5,
	},
	buttonInnerActive: {
		backgroundColor: "#EF4444",
		shadowColor: "#EF4444",
	},
	buttonIcon: {
		transform: [{ translateY: 2 }],
	},
});
