import { Animated, Pressable, StyleSheet, View } from "react-native";

interface RecordButtonProps {
	onToggleRecording: () => void;
	borderRadius: Animated.AnimatedInterpolation<number>;
	scale: Animated.AnimatedInterpolation<number>;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
	onToggleRecording,
	borderRadius,
	scale,
}) => {
	return (
		<Pressable onPress={onToggleRecording}>
			<View>
				<Animated.View
					style={[
						styles.recordButtonInner,
						{
							borderRadius,
							transform: [{ scale }],
						},
					]}
				/>
				<View style={[styles.recordButtonBorder]} />
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	recordButtonInner: {
		backgroundColor: "#ff0000",
		width: 60,
		height: 60,
	},
	recordButtonBorder: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderWidth: 4,
		borderColor: "white",
		position: "absolute",
	},
});
