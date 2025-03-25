import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { BouncyPressable } from "./BouncyPressable";

interface RoundButtonProps {
	onPress?: (() => void) | undefined;
	children: ReactNode;
	containerStyle?: ViewStyle;
	size?: number;
	disabled?: boolean;
}

export const RoundButton = ({
	onPress,
	children,
	containerStyle,
	size = 64,
	disabled = false,
}: RoundButtonProps) => {
	return (
		<View style={[styles.layout, containerStyle]}>
			<BouncyPressable
				onPress={onPress}
				style={{ width: size + 4, height: size + 4 }}
				disabled={disabled}
			>
				<LinearGradient
					colors={["#f78f9e", "#ae3bd1"]}
					start={{ x: 0, y: 0.5 }}
					end={{ x: 1, y: 0.5 }}
					style={[styles.buttonBorder, { width: size + 4, height: size + 4 }]}
				>
					<LinearGradient
						colors={["#C26E73", "#AC1ED6"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={[styles.button, { width: size, height: size }]}
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
		shadowColor: "#f78f9e",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.5,
		shadowRadius: 8,
		elevation: 10,
	},

	button: {
		borderRadius: 32,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonBorder: {
		borderRadius: 34,
		justifyContent: "center",
		alignItems: "center",
	},
	pressed: {
		opacity: 0.8,
	},
});
