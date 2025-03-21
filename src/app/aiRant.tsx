import * as SplashScreen from "expo-splash-screen";
import { fetch as expoFetch } from "expo/fetch";
import { useCallback, useState, useRef } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";

import {
	StyleSheet,
	View,
	TextInput,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../components/Text";
import { colors } from "../constants/colors";
import { Header } from "../components/Header";
import { rantSchema } from "./api/chat-rant+api";
import { BouncyPressable } from "../components/BouncyPressable";

export default function AIRant() {
	const [input, setInput] = useState("");
	const [rantMessage, setRantMessage] = useState<string | undefined>(undefined);
	const scrollViewRef = useRef<ScrollView>(null);

	const safeAreaInsets = useSafeAreaInsets();

	const handleLayout = useCallback(() => {
		SplashScreen.hideAsync();
	}, []);

	const {
		object: rantContent,
		submit: generateRant,
		error,

		isLoading,
	} = useObject({
		fetch: expoFetch as unknown as typeof globalThis.fetch,
		api: "http://localhost:8081/api/chat-rant",
		schema: rantSchema,
		// onFinish: (result) => {
		// 	console.log("result", result);
		// },
		// onError: (error) => {
		// 	console.log("error 22", error);
		// },
		// headers: {
		// 	Accept: "text/event-stream",
		// },
	});

	const scrollToBottom = useCallback(() => {
		scrollViewRef.current?.scrollToEnd({ animated: true });
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const handleSubmit = useCallback(async () => {
		if (input.trim().length === 0) return;
		generateRant({ input });
		setRantMessage(rantContent?.content || "");
	}, [input, scrollToBottom]);

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
			onLayout={handleLayout}
		>
			<Header title="AI Rant Mode" />

			<View style={styles.content}>
				{rantMessage !== undefined ? (
					<View style={styles.responseContainer}>
						<ScrollView
							ref={scrollViewRef}
							style={styles.scrollView}
							contentContainerStyle={styles.scrollContent}
							showsVerticalScrollIndicator={true}
							onContentSizeChange={scrollToBottom}
						>
							<Text style={styles.responseText}>{rantContent?.content}</Text>
							{isLoading && !rantContent?.content && (
								<View style={styles.typingIndicator}>
									<ActivityIndicator color={colors.vibrantPurple} />
									<Text style={styles.typingText}>
										AI is starting the rant...
									</Text>
								</View>
							)}
						</ScrollView>
						<BouncyPressable
							style={styles.newRantButton}
							onPress={() => {
								setInput("");
								setRantMessage(undefined);
							}}
						>
							<Text>New Rant</Text>
						</BouncyPressable>
					</View>
				) : (
					<View style={styles.inputContainer}>
						<Text style={styles.prompt}>
							What would you like me to rant about?
						</Text>
						<View style={styles.inputWrapper}>
							<TextInput
								style={styles.input}
								value={input}
								onChangeText={setInput}
								placeholder="Enter a topic..."
								placeholderTextColor={colors.lightGrey}
								multiline
								onSubmitEditing={handleSubmit}
							/>
							<BouncyPressable
								style={styles.submitButton}
								onPress={handleSubmit}
							>
								<Text>{"Generate Rant"}</Text>
							</BouncyPressable>
						</View>
					</View>
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
	inputContainer: {
		width: "100%",
		alignItems: "center",
	},
	prompt: {
		color: colors.white,
		fontSize: 24,
		marginBottom: 20,
		textAlign: "center",
	},
	inputWrapper: {
		width: "100%",
		maxWidth: 600,
	},
	input: {
		backgroundColor: colors.darkGrey,
		borderRadius: 15,
		padding: 15,
		color: colors.white,
		fontSize: 16,
		minHeight: 100,
		textAlignVertical: "top",
		marginBottom: 15,
	},
	submitButton: {
		backgroundColor: colors.vibrantPurple,
		color: colors.white,
		padding: 15,
		borderRadius: 15,
		textAlign: "center",
		fontSize: 16,
	},
	submitButtonDisabled: {
		opacity: 0.5,
	},
	responseContainer: {
		width: "100%",
		padding: 20,
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	responseText: {
		color: colors.white,
		fontSize: 16,
		lineHeight: 24,
		marginBottom: 20,
		marginTop: 30,
	},
	newRantButton: {
		backgroundColor: colors.vibrantPurple,
		color: colors.white,
		padding: 15,
		borderRadius: 15,
		textAlign: "center",
		fontSize: 16,
		marginTop: 10,
	},
	typingIndicator: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
	},
	typingText: {
		color: colors.lightGrey,
		marginLeft: 10,
		fontSize: 14,
	},
});
