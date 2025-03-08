import Ionicons from "@expo/vector-icons/Ionicons";
import { Animated, Pressable } from "react-native";
import { styles } from "./styles";

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
