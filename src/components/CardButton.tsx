import type { ViewStyle, TextStyle } from "react-native";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Text } from "./Text";
import { BouncyPressable } from "./BouncyPressable";
import { BlurView } from "expo-blur";

interface CardButtonProps {
	text: string;
	textColor?: string;
	borderColor?: string;
	style?: ViewStyle;
	textStyle?: TextStyle;
	iconSize?: number;
	iconColor?: string;
	onPress: () => void;
}

export const CardButton = ({
	text,
	textColor = "white",
	borderColor = "#333",
	style,
	textStyle,
	iconSize = 24,
	iconColor = "white",
	onPress,
}: CardButtonProps) => {
	return (
		<BouncyPressable onPress={onPress}>
			<View
				style={[
					styles.container,
					{
						borderColor,
					},
					style,
				]}
			>
				<BlurView intensity={80} tint="dark" style={styles.card}>
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
				</BlurView>
			</View>
		</BouncyPressable>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 30,
		borderWidth: 1,
		overflow: "hidden",
		height: 170,
		width: 140,
	},
	card: {
		padding: 16,
		height: "100%",
		width: "100%",
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
