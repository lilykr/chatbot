import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { colors } from "../constants/colors";
import { BouncyPressable } from "./BouncyPressable";
import { Text } from "./Text";

interface GradientButtonProps {
	onPress: () => void;
	text: string;
	textStyle?: TextStyle;
	containerStyle?: ViewStyle;
	buttonStyle?: ViewStyle;
	gradientColors?: readonly [string, string, ...string[]];
	gradientStart?: { x: number; y: number };
	gradientEnd?: { x: number; y: number };
	disabled?: boolean;
}

export function GradientButton({
	onPress,
	text,
	textStyle,
	buttonStyle,
	gradientColors = ["#f78f9e", "#ae3bd1"],
	gradientStart = { x: 0, y: 0.5 },
	gradientEnd = { x: 1, y: 0.5 },
	disabled = false,
}: GradientButtonProps) {
	return (
		<BouncyPressable
			style={styles.buttonContainer}
			onPress={onPress}
			disabled={disabled}
		>
			<LinearGradient
				colors={gradientColors}
				start={gradientStart}
				end={gradientEnd}
				style={[styles.button, buttonStyle]}
			>
				<Text style={[styles.text, textStyle]} weight="semibold">
					{text}
				</Text>
			</LinearGradient>
		</BouncyPressable>
	);
}

const styles = StyleSheet.create({
	buttonContainer: {
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
	},
	button: {
		width: "100%",
		padding: 16,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		display: "flex",
	},
	text: {
		color: colors.white,
		fontSize: 18,
		width: "100%",
		textAlign: "center",
	},
});
