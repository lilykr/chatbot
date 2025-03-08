import Ionicons from "@expo/vector-icons/Ionicons";
import { Animated, Pressable, StyleSheet } from "react-native";

interface FlashButtonProps {
	flash: boolean;
	showFlash: boolean;
	onToggleFlash: () => void;
	rotationStyle: {
		transform: {
			rotate: Animated.AnimatedInterpolation<string>;
		}[];
	};
}

export const FlashButton: React.FC<FlashButtonProps> = ({
	flash,
	showFlash,
	onToggleFlash,
	rotationStyle,
}) => {
	return (
		<Animated.View style={rotationStyle}>
			<Pressable
				onPress={onToggleFlash}
				style={[
					styles.flipButton,
					flash && styles.activeFlipButton,
					!showFlash && styles.disabledButton,
				]}
				disabled={!showFlash}
			>
				<Ionicons name="flash" size={30} color={flash ? "#ffeb3b" : "white"} />
			</Pressable>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	flipButton: {
		padding: 8,
		backgroundColor: "rgba(0, 0, 0, 0.3)",
		borderRadius: 25,
		width: 50,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
	},
	activeFlipButton: {
		backgroundColor: "rgba(255, 235, 59, 0.3)",
	},
	disabledButton: {
		opacity: 0,
	},
});
