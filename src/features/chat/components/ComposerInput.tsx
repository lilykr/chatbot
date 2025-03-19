import type React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors } from "../../../constants/colors";
import { font } from "../../../constants/font";
import { Text } from "../../../components/Text";

interface ComposerInputProps {
	value: string;
	onChangeText: (text: string) => void;
	onSubmit: () => void;
	onCameraPress: () => void;
	isQuickReplies?: boolean;
}

export const ComposerInput: React.FC<ComposerInputProps> = ({
	value,
	onChangeText,
	onSubmit,
	onCameraPress,
	isQuickReplies = false,
}) => {
	return (
		<View style={styles.container}>
			<View
				style={[
					styles.inputContainer,
					{
						borderColor: isQuickReplies ? colors.lightGrey : colors.white,
					},
				]}
			>
				{!isQuickReplies && (
					<Pressable onPress={onCameraPress} style={styles.cameraButton}>
						<Ionicons name="camera" size={24} color={colors.white} />
					</Pressable>
				)}

				<TextInput
					style={styles.input}
					value={value}
					onChangeText={onChangeText}
					placeholder={
						isQuickReplies ? "Faites votre choix" : "Tapez un message"
					}
					placeholderTextColor={colors.lightGrey}
					multiline
					onSubmitEditing={onSubmit}
					editable={!isQuickReplies}
				/>

				{value.trim().length > 0 && (
					<Pressable onPress={onSubmit} style={styles.sendButton}>
						<Text style={styles.sendButtonText}>Envoyer</Text>
					</Pressable>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 15,
		paddingBottom: 10,
		paddingTop: 5,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.night,
		borderRadius: 50,
		borderWidth: 1,
		borderColor: colors.white,
		paddingHorizontal: 5,
		paddingVertical: 5,
		borderCurve: "circular",
	},
	cameraButton: {
		marginLeft: 12,
		marginBottom: 10,
	},
	input: {
		flex: 1,
		color: colors.white,
		fontFamily: font.regular,
		paddingHorizontal: 10,
		paddingVertical: 5,
		fontSize: 16,
	},
	sendButton: {
		paddingHorizontal: 15,
		justifyContent: "center",
	},
	sendButtonText: {
		color: colors.vibrantPurple,
		fontSize: 16,
		fontFamily: font.medium,
	},
});
