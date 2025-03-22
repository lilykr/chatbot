import React from "react";
import { StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import { BouncyPressable } from "./BouncyPressable";
import { Text } from "./Text";
import { colors } from "../constants/colors";

interface PillProps {
	label: string;
	onPress?: () => void;
	style?: StyleProp<ViewStyle>;
	textColor?: string;
	backgroundColor?: string;
}

export const Pill = ({
	label,
	onPress,
	style,
	textColor = colors.white,
	backgroundColor = colors.darkGrey,
}: PillProps) => {
	return (
		<BouncyPressable
			style={[styles.pill, { backgroundColor }, style]}
			onPress={onPress}
		>
			<Text style={[styles.pillText, { color: textColor }]}>{label}</Text>
		</BouncyPressable>
	);
};

const styles = StyleSheet.create({
	pill: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
	},
	pillText: {
		fontSize: 14,
	},
});
