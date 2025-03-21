import { StyleSheet, TextInput, View } from "react-native";
import { Text } from "./Text";
import { BouncyPressable } from "./BouncyPressable";
import { colors } from "../constants/colors";

interface Props {
	input: string;
	onInputChange: (text: string) => void;
	onSubmit: () => void;
	prompt: string;
	submitButtonText?: string;
	placeholder: string;
}

export function ChatSingleInput({
	input,
	onInputChange,
	onSubmit,
	prompt,
	submitButtonText,
	placeholder,
}: Props) {
	return (
		<View style={styles.inputContainer}>
			<Text style={styles.prompt}>{prompt}</Text>
			<View style={styles.inputWrapper}>
				<TextInput
					style={styles.input}
					value={input}
					onChangeText={onInputChange}
					placeholder={placeholder}
					placeholderTextColor={colors.lightGrey}
					multiline
					onSubmitEditing={onSubmit}
				/>
				<BouncyPressable style={styles.submitButton} onPress={onSubmit}>
					<Text>{submitButtonText}</Text>
				</BouncyPressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	inputContainer: {
		width: "100%",
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
	input: {
		backgroundColor: colors.darkGrey,
		borderRadius: 15,
		padding: 15,
		color: colors.white,
		fontSize: 16,
		minHeight: 100,
		textAlignVertical: "top",
		marginBottom: 15,
	},
	submitButton: {
		backgroundColor: colors.vibrantPurple,
		color: colors.white,
		padding: 15,
		borderRadius: 15,
		textAlign: "center",
		fontSize: 16,
	},
});
