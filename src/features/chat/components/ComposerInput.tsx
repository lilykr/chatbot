import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useEffect, useRef } from "react";
import { Animated, Keyboard, StyleSheet, TextInput, View } from "react-native";
import { BouncyPressable } from "../../../components/BouncyPressable";
import { colors } from "../../../constants/colors";
import { font } from "../../../constants/font";
import { useI18n } from "../../../i18n/i18n";
import { SendButton } from "./SendButton";

interface ComposerInputProps {
	value: string;
	onChangeText: (text: string) => void;
	onSubmit: () => void;
	onCameraPress?: () => void;
	onVoicePress?: () => void;
	isQuickReplies?: boolean;
	inputRef?: React.RefObject<TextInput>;
}

export const ComposerInput: React.FC<ComposerInputProps> = ({
	value,
	onChangeText,
	onSubmit,
	onVoicePress,
	isQuickReplies = false,
	inputRef,
}) => {
	const { t } = useI18n();
	const hasInput = value.trim().length > 0;
	const voiceScaleAnim = useRef<Animated.Value>(new Animated.Value(1)).current;
	const sendScaleAnim = useRef<Animated.Value>(new Animated.Value(0)).current;

	const handleVoicePress = () => {
		Keyboard.dismiss();
		onVoicePress?.();
	};
	useEffect(() => {
		Animated.spring(voiceScaleAnim, {
			toValue: hasInput ? 0 : 1,
			useNativeDriver: true,
		}).start();

		Animated.spring(sendScaleAnim, {
			toValue: hasInput ? 1 : 0,
			useNativeDriver: true,
		}).start();
	}, [hasInput, voiceScaleAnim, sendScaleAnim]);

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
				{/* Camera button */}
				{/* <Pressable onPress={onCameraPress} style={styles.cameraButton}>
						<Ionicons name="camera" size={24} color={colors.white} />
					</Pressable> */}

				<TextInput
					keyboardAppearance="dark"
					ref={inputRef}
					style={styles.input}
					value={value}
					onChangeText={onChangeText}
					placeholder={t("app.type_a_message")}
					placeholderTextColor={colors.lightGrey}
					multiline
					onSubmitEditing={onSubmit}
					editable={!isQuickReplies}
				/>

				<View style={styles.buttonContainer}>
					{/* Voice button - shown when no input */}
					{onVoicePress && (
						<Animated.View
							style={[
								styles.voiceButtonContainer,
								{
									transform: [{ scale: voiceScaleAnim }],
									zIndex: hasInput ? 1 : 2,
									opacity: voiceScaleAnim,
									pointerEvents: hasInput ? "none" : "auto",
								},
							]}
						>
							<BouncyPressable
								onPress={handleVoicePress}
								style={styles.voiceButton}
								disabled={hasInput}
							>
								<View style={styles.voiceButtonInner}>
									<Ionicons name="mic" size={20} color={colors.white} />
								</View>
							</BouncyPressable>
						</Animated.View>
					)}

					{/* Send button - shown when has input */}
					<Animated.View
						style={[
							styles.sendButtonContainer,
							{
								transform: [{ scale: sendScaleAnim }],
								zIndex: hasInput ? 2 : 1,
								opacity: sendScaleAnim,
								pointerEvents: hasInput ? "auto" : "none",
							},
						]}
					>
						<SendButton onPress={onSubmit} isDisabled={!hasInput} />
					</Animated.View>
				</View>
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
	buttonContainer: {
		position: "relative",
		width: 32,
		height: 32,
		justifyContent: "center",
		alignItems: "center",
	},
	voiceButtonContainer: {
		position: "absolute",
		width: 32,
		height: 32,
	},
	sendButtonContainer: {
		position: "absolute",
		width: 32,
		height: 32,
	},
	voiceButton: {
		width: 32,
		height: 32,
		justifyContent: "center",
		alignItems: "center",
	},
	voiceButtonInner: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.vibrantPurple,
		justifyContent: "center",
		alignItems: "center",
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
