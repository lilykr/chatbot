import type React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { colors } from "../../../constants/colors";
import { font } from "../../../constants/font";
import { SendButton } from "./SendButton";

interface ComposerInputProps {
	value: string;
	onChangeText: (text: string) => void;
	onSubmit: () => void;
	onCameraPress: () => void;
	isQuickReplies?: boolean;
	inputRef?: React.RefObject<TextInput>;
}

export const ComposerInput: React.FC<ComposerInputProps> = ({
	value,
	onChangeText,
	onSubmit,
	onCameraPress,
	isQuickReplies = false,
	inputRef,
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
				{/* <Pressable onPress={onCameraPress} style={styles.cameraButton}>
						<Ionicons name="camera" size={24} color={colors.white} />
					</Pressable> */}

				<TextInput
					keyboardAppearance="dark"
					ref={inputRef}
					autoFocus={true}
					style={styles.input}
					value={value}
					onChangeText={onChangeText}
					placeholder={"Tapez un message"}
					placeholderTextColor={colors.lightGrey}
					multiline
					onSubmitEditing={onSubmit}
					editable={!isQuickReplies}
				/>

				<SendButton onPress={onSubmit} isDisabled={value.trim().length === 0} />
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
		height: 42,
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
});
