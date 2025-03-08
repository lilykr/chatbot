import Ionicons from "@expo/vector-icons/Ionicons";
import { Animated, Pressable, StyleSheet } from "react-native";

interface FlipCameraButtonProps {
	isRecording: boolean;
	onToggleCameraFacing: () => void;
	rotationStyle: {
		transform: {
			rotate: Animated.AnimatedInterpolation<string>;
		}[];
	};
}

export const FlipCameraButton: React.FC<FlipCameraButtonProps> = ({
	isRecording,
	onToggleCameraFacing,
	rotationStyle,
}) => {
	return (
		<Animated.View style={rotationStyle}>
			<Pressable
				disabled={isRecording}
				onPress={onToggleCameraFacing}
				style={[styles.flipButton, isRecording ? { opacity: 0 } : null]}
			>
				<Ionicons name="camera-reverse" size={30} color="white" />
			</Pressable>
		</Animated.View>
	);
};

export const styles = StyleSheet.create({
	flipButton: {
		padding: 8,
		backgroundColor: "rgba(0, 0, 0, 0.3)",
		borderRadius: 25,
		width: 50,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
	},
});
