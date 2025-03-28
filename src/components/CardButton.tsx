import { Feather } from "@expo/vector-icons";
import type { TextStyle, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { BouncyPressable } from "./BouncyPressable";
import { Text } from "./Text";

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
				<View style={styles.card}>
					<View style={styles.overlay} />
					<Text
						style={[
							styles.buttonText,
							{
								color: textColor,
								fontSize: 18,
								lineHeight: 22,
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
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "black",
		opacity: 0.5,
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
