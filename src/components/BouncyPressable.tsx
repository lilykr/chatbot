import React, { useRef, type ReactNode } from "react";
import {
	Animated,
	Pressable,
	type PressableProps,
	type StyleProp,
	StyleSheet,
	type ViewStyle,
} from "react-native";

type BouncyPressableProps = {
	onPress?: (() => void) | undefined;
	style?: StyleProp<ViewStyle>;
	children: ReactNode;
} & PressableProps;

export const BouncyPressable = ({
	onPress,
	style,
	children,
	...props
}: BouncyPressableProps) => {
	const scaleAnim = useRef(new Animated.Value(1)).current;

	const handlePressIn = () => {
		Animated.spring(scaleAnim, {
			toValue: 0.9,
			useNativeDriver: true,
			friction: 5,
			tension: 40,
		}).start();
	};

	const handlePressOut = () => {
		Animated.spring(scaleAnim, {
			toValue: 1,
			useNativeDriver: true,
			friction: 3,
			tension: 40,
		}).start();
	};

	return (
		<Pressable
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			{...props}
		>
			<Animated.View
				style={[styles.container, style, { transform: [{ scale: scaleAnim }] }]}
			>
				{children}
			</Animated.View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: "center",
		alignItems: "center",
	},
});
