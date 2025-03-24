import { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";
import { GradientButton } from "./GradientButton";
import { SkiaLoader } from "./SkiaLoader";

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
	const fadeAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (content) {
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 500,
				useNativeDriver: true,
			}).start();
		} else {
			fadeAnim.setValue(0);
		}
	}, [content, fadeAnim]);

	return (
		<View style={styles.responseContainer}>
			<ScrollView
				ref={scrollViewRef}
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={true}
			>
				<Animated.Text style={[styles.responseText, { opacity: fadeAnim }]}>
					{content}
				</Animated.Text>
				<View style={styles.loadingContainer}>
					{isLoading && !content && <SkiaLoader size={100} />}
				</View>
			</ScrollView>
			<GradientButton onPress={onNewResponse} text={newResponseButtonText} />
		</View>
	);
}

const styles = StyleSheet.create({
	responseContainer: {
		width: "100%",
		flex: 1,
		paddingTop: 56,
	},
	scrollView: {
		flex: 1,
	},
	loadingContainer: {
		height: 120,
		width: 120,
		alignSelf: "center",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	scrollContent: {
		flexGrow: 1,
	},
	responseText: {
		color: colors.white,
		fontSize: 24,
		lineHeight: 46,
		marginBottom: 20,
		marginTop: 30,
		paddingHorizontal: 20,
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
