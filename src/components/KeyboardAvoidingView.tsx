import type React from "react";
import type { ReactNode } from "react";
import { Platform, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
	Easing,
	runOnJS,
	useAnimatedKeyboard,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

interface KeyboardAvoidingViewProps {
	children: ReactNode;
	style?: ViewStyle;
	/**
	 * Additional offset to apply when keyboard is visible
	 * @default 0
	 */
	offset?: number;
	/**
	 * Additional offset to apply only when keyboard is opened
	 * @default 0
	 */
	keyboardOpenedOffset?: number;
	/**
	 * Whether to enable the animation
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * Whether to avoid keyboard on Android
	 * @default true
	 */
	androidHandleKeyboard?: boolean;
	/**
	 * Whether to avoid keyboard on iOS
	 * @default true
	 */
	iosHandleKeyboard?: boolean;
	/**
	 * Duration of the animation in milliseconds
	 * @default 250
	 */
	duration?: number;
	/**
	 * Easing function for the animation
	 * @default Easing.out(Easing.cubic)
	 */
	easing?: typeof Easing.ease;
}

const logKeyboardHeight = (height: number) => {
	console.log("Keyboard height:", height);
};

/**
 * A component that automatically adjusts its position when the keyboard appears
 * with smooth animations powered by Reanimated.
 */
export const KeyboardAvoidingView: React.FC<KeyboardAvoidingViewProps> = ({
	children,
	style,
	offset = 0,
	keyboardOpenedOffset = 0,
	enabled = true,
	androidHandleKeyboard = true,
	iosHandleKeyboard = true,
	duration = 250,
	easing = Easing.out(Easing.cubic),
}) => {
	const keyboard = useAnimatedKeyboard();
	const extraOffset = useSharedValue(offset);
	const extraKeyboardOpenedOffset = useSharedValue(keyboardOpenedOffset);

	const shouldHandleKeyboard =
		(Platform.OS === "ios" && iosHandleKeyboard) ||
		(Platform.OS === "android" && androidHandleKeyboard);

	const translateY = useDerivedValue(() => {
		if (!enabled || !shouldHandleKeyboard) return 0;

		// Log the keyboard height value
		runOnJS(logKeyboardHeight)(keyboard.height.value);

		// Calculate additional offset for keyboard opened state
		const keyboardOffset =
			keyboard.height.value > 0 ? extraKeyboardOpenedOffset.value : 0;

		return (
			-Math.max(0, keyboard.height.value) - extraOffset.value - keyboardOffset
		);
	});

	const animatedStyles = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: withTiming(translateY.value, {
						duration: duration,
						easing: easing,
					}),
				},
			],
		};
	});

	return (
		<Animated.View style={[styles.container, style, animatedStyles]}>
			{children}
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
