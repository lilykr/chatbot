import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export const useRecordingAnimation = (isRecording: boolean) => {
	const animatedValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: isRecording ? 1 : 0,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [isRecording, animatedValue]);

	const borderRadius = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [30, 12],
	});

	const scale = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [1, 0.6],
	});

	return { borderRadius, scale };
};
