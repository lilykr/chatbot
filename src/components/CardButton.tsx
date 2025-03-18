import type { ViewStyle, TextStyle } from "react-native";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Text } from "./Text";

interface CardButtonProps {
	text: string;
	backgroundColor?: string;
	textColor?: string;
	borderColor?: string;
	style?: ViewStyle;
	textStyle?: TextStyle;
	iconSize?: number;
	iconColor?: string;
}

export const CardButton = ({
	text,
	backgroundColor = "black",
	textColor = "white",
	borderColor = "#333",
	style,
	textStyle,
	iconSize = 24,
	iconColor = "white",
}: CardButtonProps) => {
	return (
		<View
			style={[
				styles.card,
				{
					backgroundColor,
					borderColor,
				},
				style,
			]}
		>
			<Text
				style={[
					styles.buttonText,
					{
						color: textColor,
						fontSize: 18,
					},
					textStyle,
				]}
				weight="medium"
			>
				{text}
			</Text>
			<Feather
				name="arrow-up-right"
				size={iconSize}
				color={iconColor}
				style={styles.arrow}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		borderRadius: 30,
		borderWidth: 1,
		padding: 16,
		height: 180,
		width: 140,
		position: "relative",
	},
	buttonText: {
		fontSize: 16,
		position: "absolute",
		top: 16,
		left: 16,
	},
	arrow: {
		position: "absolute",
		bottom: 16,
		right: 16,
	},
});
