import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { BouncyPressable } from "./BouncyPressable";

interface RoundButtonProps {
	onPress?: (() => void) | undefined;
	children: ReactNode;
	containerStyle?: ViewStyle;
}

export const RoundButton = ({
	onPress,
	children,
	containerStyle,
}: RoundButtonProps) => {
	return (
		<View style={[styles.layout, containerStyle]}>
			<BouncyPressable onPress={onPress} style={styles.buttonContainer}>
				<LinearGradient
					colors={["#f78f9e", "#ae3bd1"]}
					start={{ x: 0, y: 0.5 }}
					end={{ x: 1, y: 0.5 }}
					style={styles.buttonBorder}
				>
					<LinearGradient
						colors={["#C26E73", "#AC1ED6"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.button}
					>
						{children}
					</LinearGradient>
				</LinearGradient>
			</BouncyPressable>
		</View>
	);
};

const styles = StyleSheet.create({
	layout: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	buttonContainer: {
		width: 68,
		height: 68,
	},
	button: {
		width: 64,
		height: 64,
		borderRadius: 32,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonBorder: {
		width: 68,
		height: 68,
		borderRadius: 34,
		justifyContent: "center",
		alignItems: "center",
	},
	pressed: {
		opacity: 0.8,
	},
});
