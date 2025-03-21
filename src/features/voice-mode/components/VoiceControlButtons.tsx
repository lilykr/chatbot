import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BouncyPressable } from "../../../components/BouncyPressable";

interface IconButtonProps {
	onPress?: () => void;
}

export const VoiceControlButtons = ({ onPress }: IconButtonProps) => {
	const safeAreaInsets = useSafeAreaInsets();
	return (
		<View style={[styles.layout, { marginBottom: safeAreaInsets.bottom + 32 }]}>
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
						<SimpleLineIcons name="microphone" size={28} color="white" />
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
	innerCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#FF00FF", // Solid pink
	},
});
