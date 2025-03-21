
import * as SplashScreen from "expo-splash-screen";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatSingleInput } from "../components/ChatSingleInput";
import { Header } from "../components/Header";
import { ResponseDisplay } from "../components/ResponseDisplay";
import { Text } from "../components/Text";
import { colors } from "../constants/colors";
import { rantSchema } from "./api/chat-rant+api";
import { ChatSingleInput } from "../components/ChatSingleInput";
import { ResponseDisplay } from "../components/ResponseDisplay";

export default function AIRant() {
	const [input, setInput] = useState("");
	const [rantMessage, setRantMessage] = useState<string | undefined>(undefined);
	const safeAreaInsets = useSafeAreaInsets();

	const {
		object: rantContent,
		submit: generateRant,
		error,
		isLoading,
	} = useObject({
		fetch: expoFetch as unknown as typeof globalThis.fetch,
		api: "http://localhost:8081/api/chat-rant",
		schema: rantSchema,
	});

	const handleSubmit = useCallback(async () => {
		if (input.trim().length === 0) return;
		generateRant({ input });
		setRantMessage(rantContent?.content || "");
	}, [input, rantContent?.content, generateRant]);

	const handleNewRant = useCallback(() => {
		setInput("");
		setRantMessage(undefined);
	}, []);

	if (error) return <Text style={{ color: "white" }}>{error.message}</Text>;

	return (
		<View
			style={[
				styles.container,
				{
					paddingTop: safeAreaInsets.top,
					paddingBottom: safeAreaInsets.bottom,
				},
			]}
		>
			<Header title="AI Rant Mode" />

			<View style={styles.content}>
				{rantMessage !== undefined ? (
					<ResponseDisplay
						content={rantContent?.content}
						isLoading={isLoading}
						onNewResponse={handleNewRant}
					/>
				) : (
					<ChatSingleInput
						input={input}
						onInputChange={setInput}
						onSubmit={handleSubmit}
						prompt="What would you like me to rant about?"
						placeholder="Enter a topic..."
					/>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.night,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
