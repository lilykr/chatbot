import Ionicons from "@expo/vector-icons/Ionicons";
import { Animated, Pressable, StyleSheet } from "react-native";

interface CloseButtonProps {
	onClose: () => void;
	rotationStyle: {
		transform: {
			rotate: Animated.AnimatedInterpolation<string>;
		}[];
	};
}

export const CloseButton: React.FC<CloseButtonProps> = ({
	onClose,
	rotationStyle,
}) => {
	return (
		<Animated.View style={rotationStyle}>
			<Pressable onPress={onClose} style={styles.closeButton}>
				<Ionicons name="close" size={24} color="white" />
			</Pressable>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	closeButton: {
		width: 40,
		alignItems: "center",
	},
});
