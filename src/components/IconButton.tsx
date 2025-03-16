import { Pressable, StyleSheet } from "react-native";

interface IconButtonProps {
	onPress?: () => void;
}

export const IconButton = ({ onPress }: IconButtonProps) => {
	return (
		<Pressable
			style={({ pressed }) => [styles.button, pressed && styles.pressed]}
			onPress={onPress}
		>
			<Pressable style={styles.innerCircle} onPress={onPress} />
		</Pressable>
	);
};

const styles = StyleSheet.create({
	button: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: "#FF00FF40", // Semi-transparent pink
		justifyContent: "center",
		alignItems: "center",
	},
	pressed: {
		opacity: 0.8,
	},
	innerCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#FF00FF", // Solid pink
	},
});
