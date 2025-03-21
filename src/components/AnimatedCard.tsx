import { vec } from "@shopify/react-native-skia";
import React from "react";
import {
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { LLK_AVATAR } from "../app/chatWithLily/[chatId]";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = 0.8 * width;
const CARD_HEIGHT = 0.7 * height;

const IMAGE_HEIGHT = 0.45 * CARD_HEIGHT;
const c = vec(IMAGE_HEIGHT / 2, IMAGE_HEIGHT / 2);
const r = c.x - 32;
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity =
	Animated.createAnimatedComponent(TouchableOpacity);
const MAX_SWIPE = Math.ceil(CARD_WIDTH - 50);

const AnimatedCard = () => {
	const x = useSharedValue(0);
	const y = useSharedValue(0);
	const absoluteX = useSharedValue(0);
	const absoluteY = useSharedValue(0);
	const rotateX = useSharedValue(0);
	const rotateY = useSharedValue(0);
	const imageScale = useSharedValue(1);
	const dragGesture = Gesture.Pan()
		.onBegin((e) => {
			absoluteX.value = e.absoluteX;
			absoluteY.value = e.absoluteY;
		})
		.onUpdate((e) => {
			const x = e.absoluteX - absoluteX.value;
			const y = e.absoluteY - absoluteY.value;
			if (x < MAX_SWIPE) {
				rotateX.value = x;
				imageScale.value = 1.2;
			}
			if (y < MAX_SWIPE) {
				rotateY.value = y;
				imageScale.value = 1.2;
			}
		})
		.onEnd((e) => {
			rotateX.value = withSpring(0);
			rotateY.value = withSpring(0);
			imageScale.value = 1;
		});

	const animatedCard = useAnimatedStyle(() => {
		const xAxisRotation = `${interpolate(
			rotateX.value,
			[-MAX_SWIPE, MAX_SWIPE],
			[-40, 40],
			{
				extrapolateLeft: Extrapolation.CLAMP,
				extrapolateRight: Extrapolation.CLAMP,
			},
		)}deg`;
		const yAxisRotation = `${interpolate(
			rotateY.value,
			[-MAX_SWIPE, MAX_SWIPE],
			[40, -40],
			{
				extrapolateLeft: Extrapolation.CLAMP,
				extrapolateRight: Extrapolation.CLAMP,
			},
		)}deg`;
		return {
			transform: [
				{ perspective: 1500 },
				{ rotateX: yAxisRotation },
				{ rotateY: xAxisRotation },
				{ translateX: x.value },
				{ translateY: y.value },
			],
		};
	});
	const animatedImage = useAnimatedStyle(() => {
		const xAxisRotation = `${interpolate(
			rotateX.value,
			[-MAX_SWIPE, MAX_SWIPE],
			[-40, 40],
			{
				extrapolateLeft: Extrapolation.CLAMP,
				extrapolateRight: Extrapolation.CLAMP,
			},
		)}deg`;
		const yAxisRotation = `${interpolate(
			rotateY.value,
			[-MAX_SWIPE, MAX_SWIPE],
			[40, -40],
			{
				extrapolateLeft: Extrapolation.CLAMP,
				extrapolateRight: Extrapolation.CLAMP,
			},
		)}deg`;
		const translationX = interpolate(
			rotateX.value,
			[-MAX_SWIPE, MAX_SWIPE],
			[-80, 80],
			{
				extrapolateLeft: Extrapolation.CLAMP,
				extrapolateRight: Extrapolation.CLAMP,
			},
		);
		const translationY = interpolate(
			rotateY.value,
			[-MAX_SWIPE, MAX_SWIPE],
			[-80, 80],
			{
				extrapolateLeft: Extrapolation.CLAMP,
				extrapolateRight: Extrapolation.CLAMP,
			},
		);
		return {
			transform: [
				{ perspective: 1500 },
				{ rotateX: yAxisRotation },
				{ rotateY: xAxisRotation },
				{ scale: withTiming(imageScale.value) },
				{ translateX: translationX },
				{ translateY: translationY },
			],
		};
	});

	const animatedPrice = useAnimatedStyle(() => {
		const translationX = interpolate(
			rotateX.value,
			[-MAX_SWIPE, MAX_SWIPE],
			[-40, 40],
			{
				extrapolateLeft: Extrapolation.CLAMP,
				extrapolateRight: Extrapolation.CLAMP,
			},
		);
		const translationY = interpolate(
			rotateY.value,
			[-MAX_SWIPE, MAX_SWIPE],
			[-30, 30],
			{
				extrapolateLeft: Extrapolation.CLAMP,
				extrapolateRight: Extrapolation.CLAMP,
			},
		);
		return {
			transform: [
				{ perspective: 1500 },
				{ translateX: translationX },
				{ translateY: translationY },
				{ scale: withTiming(imageScale.value * 0.95) },
			],
		};
	});

	const animatedButton = useAnimatedStyle(() => {
		const translationX = interpolate(
			rotateX.value,
			[-MAX_SWIPE, MAX_SWIPE],
			[-50, 50],
			{
				extrapolateLeft: Extrapolation.CLAMP,
				extrapolateRight: Extrapolation.CLAMP,
			},
		);
		const translationY = interpolate(
			rotateY.value,
			[-MAX_SWIPE, MAX_SWIPE],
			[-35, 35],
			{
				extrapolateLeft: Extrapolation.CLAMP,
				extrapolateRight: Extrapolation.CLAMP,
			},
		);
		return {
			transform: [
				{ perspective: 1500 },
				{ translateX: translationX },
				{ translateY: translationY },
				{ scale: withTiming(imageScale.value * 0.9) },
			],
		};
	});

	return (
		<GestureHandlerRootView style={styles.container}>
			<View style={styles.container}>
				<GestureDetector gesture={dragGesture}>
					<AnimatedView style={[styles.card, animatedCard]}>
						<AnimatedView style={[styles.imageContainer, animatedImage]}>
							<Image
								source={LLK_AVATAR}
								style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}
							/>
						</AnimatedView>
						<View style={styles.contentContainer}>
							<Text style={styles.title}>Animated Card</Text>
							<Text style={styles.description}>
								This card animation is created using Reanimated 2.0, React
								Native Gesture Handler and Native Base.
							</Text>
						</View>
						<View style={styles.footer}>
							<AnimatedView style={[styles.priceContainer, animatedPrice]}>
								<View style={styles.priceRow}>
									<Text style={styles.priceLabel}>Total Price</Text>
									{/* Check icon */}
									<View style={styles.checkIcon} />
								</View>
								<Text style={styles.price}>$ 8.00</Text>
							</AnimatedView>
							<View style={styles.buttonContainer}>
								<AnimatedTouchableOpacity
									style={[styles.button, animatedButton]}
								>
									<Text style={styles.buttonText}>Add to cart</Text>
								</AnimatedTouchableOpacity>
							</View>
						</View>
					</AnimatedView>
				</GestureDetector>
			</View>
		</GestureHandlerRootView>
	);
};

export default AnimatedCard;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	card: {
		borderRadius: 30,
		height: CARD_HEIGHT,
		width: CARD_WIDTH,
		backgroundColor: "#F6F3F0",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	imageContainer: {
		height: IMAGE_HEIGHT,
	},
	contentContainer: {
		height: "40%",
		paddingHorizontal: 32,
	},
	title: {
		textAlign: "center",
		fontSize: 24,
		fontWeight: "bold",
	},
	description: {
		textAlign: "justify",
		paddingTop: 8,
	},
	footer: {
		height: "15%",
		flexDirection: "row",
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		paddingHorizontal: 32,
		paddingBottom: 24,
	},
	priceContainer: {
		width: "50%",
	},
	priceRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	priceLabel: {
		fontWeight: "bold",
		marginRight: 4,
	},
	checkIcon: {
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: "#2894E1",
	},
	price: {
		fontWeight: "bold",
	},
	buttonContainer: {
		width: "50%",
	},
	button: {
		backgroundColor: "black",
		borderRadius: 10,
		padding: 10,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 4.65,
		elevation: 8,
	},
	buttonText: {
		color: "white",
	},
});
