import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { useEffect } from "react";
import { StyleSheet, useAnimatedValue } from "react-native";
import { Animated } from "react-native";
import { BouncyPressable } from "../../../components/BouncyPressable";
import { colors } from "../../../constants/colors";

interface SendButtonProps {
	onPress: () => void;
	isDisabled?: boolean;
}

export const SendButton: React.FC<SendButtonProps> = ({
	onPress,
	isDisabled = false,
}) => {
	const scaleAnim = useAnimatedValue(0);

	useEffect(() => {
		Animated.spring(scaleAnim, {
			toValue: isDisabled ? 0 : 1,
			useNativeDriver: true,
		}).start();
	}, [isDisabled, scaleAnim]);

	return (
		<BouncyPressable
			onPress={onPress}
			style={styles.sendButton}
			disabled={isDisabled}
		>
			<Animated.View
				style={[
					styles.sendButtonContainer,
					{ transform: [{ scale: scaleAnim }] },
				]}
			>
				<Ionicons name="arrow-up" size={20} color={colors.white} />
			</Animated.View>
		</BouncyPressable>
	);
};

const styles = StyleSheet.create({
	sendButton: {
		justifyContent: "center",
	},
	sendButtonContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.vibrantPurple,
		justifyContent: "center",
		alignItems: "center",
	},
});
