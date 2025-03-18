import type { CameraOrientation } from "expo-camera";
import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export const useOrientationAnimation = (
	orientation: CameraOrientation | undefined,
) => {
	const rotationAnimation = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		let rotationDegree = 0;
		switch (orientation) {
			case "portrait":
				rotationDegree = 0;
				break;
			case "portraitUpsideDown":
				rotationDegree = 180;
				break;
			case "landscapeLeft":
				rotationDegree = 90;
				break;
			case "landscapeRight":
				rotationDegree = -90;
				break;
		}

		Animated.timing(rotationAnimation, {
			toValue: rotationDegree,
			duration: 150,
			useNativeDriver: true,
			easing: Easing.ease,
		}).start();
	}, [orientation, rotationAnimation]);

	const rotationStyle = {
		transform: [
			{
				rotate: rotationAnimation.interpolate({
					inputRange: [-90, 0, 90, 180],
					outputRange: ["-90deg", "0deg", "90deg", "180deg"],
				}),
			},
		],
	};

	return rotationStyle;
};
