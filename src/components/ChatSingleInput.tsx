import { StyleSheet, TextInput, View } from "react-native";
import { colors } from "../constants/colors";
import { GradientButton } from "./GradientButton";
import { RantSuggestions } from "./RantSuggestions";
import { Text } from "./Text";

interface Props {
	input: string;
	onInputChange: (text: string) => void;
	onSubmit: () => void;
	prompt: string;
	submitButtonText: string;
	placeholder: string;
	inputRef: React.RefObject<TextInput>;
	handleTopicSelect: (topic: string) => void;
}

export function ChatSingleInput({
	input,
	onInputChange,
	onSubmit,
	prompt,
	submitButtonText,
	placeholder,
	inputRef,
	handleTopicSelect,
}: Props) {
	return (
		<View style={styles.inputContainer}>
			<Text style={styles.prompt}>{prompt}</Text>
			<View style={styles.inputWrapper}>
				<RantSuggestions onSelectTopic={handleTopicSelect} />

				<TextInput
					autoFocus
					style={styles.input}
					value={input}
					onChangeText={onInputChange}
					placeholder={placeholder}
					placeholderTextColor={colors.lightGrey}
					multiline
					onSubmitEditing={onSubmit}
					ref={inputRef}
					textAlign="center"
				/>
				<GradientButton text={submitButtonText} onPress={onSubmit} />
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
	input: {
		backgroundColor: colors.darkGrey,
		borderRadius: 15,
		padding: 15,
		color: colors.white,
		fontSize: 16,
		textAlignVertical: "top",
		marginBottom: 15,
	},
});
