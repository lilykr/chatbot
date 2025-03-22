import { Epilogue_400Regular } from "@expo-google-fonts/epilogue";
import {
	BackdropFilter,
	Canvas,
	Circle,
	Fill,
	Group,
	RoundedRect,
	Skia,
	Image as SkiaImage,
	Text,
	processTransform3d,
	useFont,
	useImage,
	usePathValue,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
	useDerivedValue,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { MeshGradientCore } from "../features/MeshGradient/components/MeshGradientCore";
import { BlurMask } from "./BlurGradient";

const LLK_AVATAR = require("../../assets/llk.png");
const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.4; // Taller card ratio
const rct = Skia.XYWHRect(
	(width - CARD_WIDTH) / 2,
	(height - CARD_HEIGHT) / 2,
	CARD_WIDTH,
	CARD_HEIGHT,
);
const rrct = Skia.RRectXY(rct, 30, 30); // More rounded corners
const roundedRectPath = Skia.Path.Make();
roundedRectPath.addRRect(rrct);

// Card contents positions
const IMAGE_HEIGHT = CARD_HEIGHT * 0.35;
const CONTENT_Y = (height - CARD_HEIGHT) / 2 + IMAGE_HEIGHT + 20;
const PRICE_Y = (height + CARD_HEIGHT) / 2 - 70;
const BUTTON_Y = (height + CARD_HEIGHT) / 2 - 40;

// Spring configuration
const sf = 300;
const springConfig = (velocity: number) => {
	"worklet";
	return {
		mass: 1,
		damping: 14,
		stiffness: 100,
		overshootClamping: false,
		restDisplacementThreshold: 0.01,
		restSpeedThreshold: 2,
		velocity,
	};
};

// Color palette for the gradient
const palette = [
	"#FEF8C4",
	"#E1F1D5",
	"#C4EBE5",
	"#ECA171",
	"#FFFCF3",
	"#D4B3B7",
	"#B5A8D2",
	"#F068A1",
	"#EDD9A2",
	"#FEEFAB",
	"#A666C0",
	"#8556E5",
	"#DC4C4C",
	"#EC795A",
	"#E599F0",
	"#96EDF2",
];

export const SkiaAnimatedCard = () => {
	const rotateX = useSharedValue(0);
	const rotateY = useSharedValue(0);
	const image = useImage(LLK_AVATAR);

	const gesture = Gesture.Pan()
		.onChange((event) => {
			rotateY.value += event.changeX / sf;
			rotateX.value -= event.changeY / sf;
		})
		.onEnd(({ velocityX, velocityY }) => {
			rotateX.value = withSpring(0, springConfig(velocityY / sf));
			rotateY.value = withSpring(0, springConfig(velocityX / sf));
		});

	// Process the transforms into matrices
	const cardMatrix = useDerivedValue(() => {
		return processTransform3d([
			{ translate: [width / 2, height / 2] },
			// Stronger perspective for more dramatic effect
			{ perspective: 400 },
			{ rotateX: rotateX.value },
			{ rotateY: rotateY.value },
			{ translate: [-width / 2, -height / 2] },
		]);
	});

	// For clip path
	const clip = usePathValue((path) => {
		"worklet";
		path.transform(cardMatrix.value);
	}, roundedRectPath);

	// Use simple transforms for content instead of matrices
	const titleFont = useFont(Epilogue_400Regular, 32);
	const subtitleFont = useFont(Epilogue_400Regular, 16);
	const smallFont = useFont(Epilogue_400Regular, 14);
	const priceFont = useFont(Epilogue_400Regular, 18);

	// Create parallax offsets based on rotation - these simulate elevation
	const titleTransform = useDerivedValue(() => {
		return [
			{ translateX: width / 2 },
			{ translateY: height / 2 },
			{ perspective: 400 },
			{ rotateX: rotateX.value },
			{ rotateY: rotateY.value },
			// Add large offset in the rotation direction to simulate elevation
			{ translateX: -width / 2 + rotateY.value * 100 },
			{ translateY: -height / 2 - rotateX.value * 100 },
			// Add slight scale adjustment for depth
			{
				scale:
					1 + Math.abs(rotateX.value) * 0.03 + Math.abs(rotateY.value) * 0.03,
			},
		];
	});

	const priceTransform = useDerivedValue(() => {
		return [
			{ translateX: width / 2 },
			{ translateY: height / 2 },
			{ perspective: 400 },
			{ rotateX: rotateX.value },
			{ rotateY: rotateY.value },
			// Larger offset for price section
			{ translateX: -width / 2 + rotateY.value * 100 },
			{ translateY: -height / 2 - rotateX.value * 100 },
			// Add moderate scale adjustment for depth
			{
				scale:
					1 + Math.abs(rotateX.value) * 0.05 + Math.abs(rotateY.value) * 0.05,
			},
		];
	});

	const buttonTransform = useDerivedValue(() => {
		return [
			{ translateX: width / 2 },
			{ translateY: height / 2 },
			{ perspective: 400 },
			{ rotateX: rotateX.value },
			{ rotateY: rotateY.value },
			// Maximum offset for button to appear highest
			{ translateX: -width / 2 + rotateY.value * 100 },
			{ translateY: -height / 2 - rotateX.value * 100 },
			// Add significant scale adjustment for depth
			{
				scale:
					1 + Math.abs(rotateX.value) * 0.08 + Math.abs(rotateY.value) * 0.08,
			},
		];
	});

	return (
		<View style={styles.container}>
			<GestureDetector gesture={gesture}>
				<Canvas style={styles.canvas}>
					{/* Background mesh gradient */}
					<MeshGradientCore rows={3} cols={3} colors={palette} play />

					{/* Card with blur effect - using the custom BlurMask that requires a matrix */}
					<BackdropFilter filter={<BlurMask matrix={cardMatrix} />} clip={clip}>
						<Fill color="rgba(255, 255, 255, 0.2)" />
					</BackdropFilter>

					{/* Title with shadow */}
					<Group transform={titleTransform}>
						<Text
							x={width / 2 - 80}
							y={CONTENT_Y}
							text="Lisa-Lou Kara"
							font={titleFont}
							color="#FFFFFF"
							opacity={
								1 -
								Math.abs(rotateX.value) * 0.1 -
								Math.abs(rotateY.value) * 0.1
							}
						/>
						<Text
							x={width / 2 - 150}
							y={CONTENT_Y + 40}
							text="React Native Developer"
							font={subtitleFont}
							color="#FFFFFF"
							opacity={
								1 -
								Math.abs(rotateX.value) * 0.1 -
								Math.abs(rotateY.value) * 0.1
							}
						/>
					</Group>

					{/* Card image */}
					<Group transform={titleTransform}>
						<RoundedRect
							x={(width - CARD_WIDTH) / 2}
							y={(height - CARD_HEIGHT) / 2}
							width={CARD_WIDTH}
							height={IMAGE_HEIGHT}
							r={30}
							color="transparent"
						>
							<BackdropFilter filter={<BlurMask matrix={cardMatrix} />}>
								<Fill color="rgba(255, 255, 255, 0.1)" />
							</BackdropFilter>
						</RoundedRect>
						{image && (
							<SkiaImage
								image={image}
								x={(width - CARD_WIDTH) / 2}
								y={(height - CARD_HEIGHT) / 2}
								width={CARD_WIDTH}
								height={IMAGE_HEIGHT}
								fit="contain"
							/>
						)}
					</Group>

					{/* Price with stronger shadow */}
					<Group transform={priceTransform}>
						<Text
							x={width / 2 - CARD_WIDTH / 4 - 50}
							y={PRICE_Y}
							text="Total Price"
							font={smallFont}
							color="#FFFFFF"
							opacity={
								1 -
								Math.abs(rotateX.value) * 0.05 -
								Math.abs(rotateY.value) * 0.05
							}
						/>
						<Circle
							cx={width / 2 - CARD_WIDTH / 4 + 30}
							cy={PRICE_Y - 7}
							r={8}
							color="#2894E1"
							opacity={
								1 -
								Math.abs(rotateX.value) * 0.05 -
								Math.abs(rotateY.value) * 0.05
							}
						/>
						<Text
							x={width / 2 - CARD_WIDTH / 4 - 50}
							y={PRICE_Y + 25}
							text="$ 8.00"
							font={priceFont}
							color="#FFFFFF"
							opacity={
								1 -
								Math.abs(rotateX.value) * 0.05 -
								Math.abs(rotateY.value) * 0.05
							}
						/>
					</Group>

					{/* Button with heaviest shadow */}
					<Group transform={buttonTransform}>
						<RoundedRect
							x={width / 2 + CARD_WIDTH / 4 - 70}
							y={BUTTON_Y - 15}
							width={140}
							height={40}
							r={10}
							color="#000000"
							opacity={
								1 -
								Math.abs(rotateX.value) * 0.02 -
								Math.abs(rotateY.value) * 0.02
							}
						/>
						<Text
							x={width / 2 + CARD_WIDTH / 4 - 50}
							y={BUTTON_Y + 10}
							text="Add to cart"
							font={subtitleFont}
							color="#FFFFFF"
							opacity={
								1 -
								Math.abs(rotateX.value) * 0.02 -
								Math.abs(rotateY.value) * 0.02
							}
						/>
					</Group>
				</Canvas>
			</GestureDetector>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	canvas: {
		flex: 1,
	},
});
