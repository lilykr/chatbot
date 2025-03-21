import { StyleSheet, View, ScrollView, ActivityIndicator } from "react-native";
import { Text } from "./Text";
import { BouncyPressable } from "./BouncyPressable";
import { colors } from "../constants/colors";
import { useCallback, useRef } from "react";

interface ResponseDisplayProps {
	content?: string | undefined;
	isLoading: boolean;
	onNewResponse: () => void;
	loadingText?: string;
	newResponseButtonText?: string;
}

export function ResponseDisplay({
	content,
	isLoading,
	onNewResponse,
	loadingText = "AI is starting the rant...",
	newResponseButtonText = "New Rant",
}: ResponseDisplayProps) {
	const scrollViewRef = useRef<ScrollView>(null);

	const scrollToBottom = useCallback(() => {
		scrollViewRef.current?.scrollToEnd({ animated: true });
	}, []);

	return (
		<View style={styles.responseContainer}>
			<ScrollView
				ref={scrollViewRef}
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={true}
				onContentSizeChange={scrollToBottom}
			>
				<Text style={styles.responseText}>{content}</Text>
				{isLoading && !content && (
					<View style={styles.typingIndicator}>
						<ActivityIndicator color={colors.vibrantPurple} />
						<Text style={styles.typingText}>{loadingText}</Text>
					</View>
				)}
			</ScrollView>
			<BouncyPressable style={styles.newResponseButton} onPress={onNewResponse}>
				<Text>{newResponseButtonText}</Text>
			</BouncyPressable>
		</View>
	);
}

const styles = StyleSheet.create({
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
	newResponseButton: {
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
