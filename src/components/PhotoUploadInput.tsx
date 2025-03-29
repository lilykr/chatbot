import { StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";
import { GradientButton } from "./GradientButton";
import { Text } from "./Text";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";

interface Props {
	onSubmit: () => void;
	prompt: string;
	submitButtonText: string;
}

export function PhotoUploadInput({
	onSubmit,
	prompt,
	submitButtonText,
}: Props) {
	return (
		<View style={styles.inputContainer}>
			<Text style={styles.prompt}>{prompt}</Text>
			<View style={styles.inputWrapper}>
				<TouchableOpacity style={styles.uploadButton} onPress={onSubmit}>
					<Ionicons name="image-outline" size={40} color={colors.white} />
					<Text style={styles.uploadText}>{submitButtonText}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	inputContainer: {
		width: "100%",
		paddingHorizontal: 20,
		paddingTop: 100,
		alignItems: "center",
	},
	prompt: {
		color: colors.white,
		fontSize: 24,
		marginBottom: 20,
		textAlign: "center",
	},
	inputWrapper: {
		width: "100%",
		maxWidth: 600,
	},
	uploadButton: {
		backgroundColor: colors.darkGrey,
		borderRadius: 15,
		padding: 20,
		alignItems: "center",
		justifyContent: "center",
		height: 200,
	},
	uploadText: {
		color: colors.white,
		fontSize: 16,
		marginTop: 10,
	},
});
