import {
	Epilogue_500Medium,
	Epilogue_700Bold,
} from "@expo-google-fonts/epilogue";
import {
	BackdropFilter,
	Canvas,
	Fill,
	Group,
	Path,
	RoundedRect,
	Skia,
	Image as SkiaImage,
	Text,
	processTransform3d,
	useFont,
	useImage,
	usePathValue,
} from "@shopify/react-native-skia";
import React, { useCallback, useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from "react-native-gesture-handler";
import {
	cancelAnimation,
	runOnJS,
	useDerivedValue,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { MeshGradientCore } from "../features/MeshGradient/components/MeshGradientCore";
import { BlurMask } from "./BlurGradient";

const LLK_AVATAR = require("../../assets/llk.png");
const LINKEDIN_ICON = require("../../assets/linkedin_icon.png");
const GITHUB_ICON = require("../../assets/github_icon.png");
const CHAT_ICON = require("../../assets/ai_round.png");

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
const IMAGE_HEIGHT = CARD_HEIGHT * 0.5;
const CONTENT_Y = (height - CARD_HEIGHT) / 2 + IMAGE_HEIGHT + 50;
const BUTTON_Y = CONTENT_Y + 65;
const BUTTON_SIZE = 80;
const BUTTONS_GAP = 16; // Gap between buttons
const ICON_SIZE = 24; // Size for LinkedIn icons (smaller than before)
const ICON_PADDING = 8; // Padding from the edges for icons
// Total width of all buttons and gaps
const TOTAL_BUTTONS_WIDTH = BUTTON_SIZE * 3 + BUTTONS_GAP * 2;
// Starting X position for the first button
const FIRST_BUTTON_X = width / 2 - TOTAL_BUTTONS_WIDTH / 2;

// Colors
const PRIMARY_TEXT_COLOR = "rgba(0, 0, 0, 0.75)";
const SECONDARY_TEXT_COLOR = "rgba(0, 0, 255, 0.75)";
const BUTTON_TEXT_COLOR = "rgba(0, 0, 0, 0.6)";
const BUTTON_BG_COLOR = "rgba(255, 255, 255, 0)";
const CARD_BORDER_COLOR = "rgba(0, 0, 0, 0)";
const BUTTON_BORDER_COLOR = "rgba(0, 0, 0, 0)";

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

// Button hit areas for tap detection
const button1Rect = {
	x: FIRST_BUTTON_X,
	y: BUTTON_Y,
	width: BUTTON_SIZE,
	height: BUTTON_SIZE,
};

const button2Rect = {
	x: FIRST_BUTTON_X + BUTTON_SIZE + BUTTONS_GAP,
	y: BUTTON_Y,
	width: BUTTON_SIZE,
	height: BUTTON_SIZE,
};

const button3Rect = {
	x: FIRST_BUTTON_X + (BUTTON_SIZE + BUTTONS_GAP) * 2,
	y: BUTTON_Y,
	width: BUTTON_SIZE,
	height: BUTTON_SIZE,
};

// Check if a point is inside a rectangle
const isPointInRect = (
	x: number,
	y: number,
	rect: { x: number; y: number; width: number; height: number },
) => {
	"worklet";
	return (
		x >= rect.x &&
		x <= rect.x + rect.width &&
		y >= rect.y &&
		y <= rect.y + rect.height
	);
};

interface SkiaAnimatedCardProps {
	onPressLinkedin?: () => void;
	onPressGithub?: () => void;
	onPressChat?: () => void;
}

export const SkiaAnimatedCard = ({
	onPressLinkedin,
	onPressGithub,
	onPressChat,
}: SkiaAnimatedCardProps) => {
	const rotateX = useSharedValue(0);
	const rotateY = useSharedValue(0);
	const image = useImage(LLK_AVATAR);
	const linkedInIcon = useImage(LINKEDIN_ICON);
	const githubIcon = useImage(GITHUB_ICON);
	const chatIcon = useImage(CHAT_ICON);
	// Timer reference for idle animation
	const lastInteractionTime = useSharedValue(Date.now());
	const animationActive = useSharedValue(false);
	const animationReady = useSharedValue(true);

	// Button press states
	const button1Pressed = useSharedValue(0);
	const button2Pressed = useSharedValue(0);
	const button3Pressed = useSharedValue(0);

	// Stop any running animations
	const stopAnimation = useCallback(() => {
		"worklet";
		if (!animationActive.value) return;

		animationActive.value = false;
		cancelAnimation(rotateX);
		cancelAnimation(rotateY);

		// Return to neutral position
		rotateX.value = withSpring(0, springConfig(0));
		rotateY.value = withSpring(0, springConfig(0));

		// Reset the animation ready state to allow future animations
		animationReady.value = true;
	}, [animationActive, animationReady, rotateX, rotateY]);

	// Check for idle time
	useEffect(() => {
		const checkIdleInterval = setInterval(() => {
			const currentTime = Date.now();
			// Start a single animation sequence if idle for 2 seconds
			if (
				currentTime - lastInteractionTime.value > 2000 &&
				!animationActive.value &&
				animationReady.value
			) {
				// Execute a single animation sequence
				animationActive.value = true;
				animationReady.value = false;

				// X rotation sequence
				rotateX.value = withSequence(
					withTiming(0.15, { duration: 800 }),
					withTiming(-0.1, { duration: 600 }),
					withTiming(0, { duration: 500 }),
				);

				// Y rotation sequence
				rotateY.value = withSequence(
					withTiming(0.3, { duration: 800 }),
					withTiming(-0.2, { duration: 600 }),
					withTiming(0, { duration: 500 }),
				);

				// Reset states after animation completes
				setTimeout(() => {
					animationActive.value = false;
					// Wait before allowing the next animation
					setTimeout(() => {
						animationReady.value = true;
					}, 3000);
				}, 1900); // Total animation duration
			}
		}, 500);

		return () => clearInterval(checkIdleInterval);
	}, [lastInteractionTime, animationActive, animationReady, rotateX, rotateY]);

	// Pan gesture for card rotation
	const panGesture = Gesture.Pan()
		.onChange((event) => {
			// Stop animation when user interacts
			if (animationActive.value) {
				stopAnimation();
			}

			rotateY.value += event.changeX / sf;
			rotateX.value -= event.changeY / sf;

			// Update last interaction time
			lastInteractionTime.value = Date.now();
		})
		.onEnd(({ velocityX, velocityY }) => {
			rotateX.value = withSpring(0, springConfig(velocityY / sf));
			rotateY.value = withSpring(0, springConfig(velocityX / sf));

			// Update last interaction time
			lastInteractionTime.value = Date.now();
		});

	// Tap gesture for buttons
	const tapGesture = Gesture.Tap()
		.onBegin((event) => {
			"worklet";
			const { x, y } = event;

			if (isPointInRect(x, y, button1Rect)) {
				button1Pressed.value = withTiming(1, { duration: 100 });
			} else if (isPointInRect(x, y, button2Rect)) {
				button2Pressed.value = withTiming(1, { duration: 100 });
			} else if (isPointInRect(x, y, button3Rect)) {
				button3Pressed.value = withTiming(1, { duration: 100 });
			}
		})
		.onFinalize((event) => {
			"worklet";
			const { x, y } = event;

			if (isPointInRect(x, y, button1Rect)) {
				button1Pressed.value = withTiming(0, { duration: 150 });
				if (onPressLinkedin) {
					runOnJS(onPressLinkedin)();
				}
			} else if (isPointInRect(x, y, button2Rect)) {
				button2Pressed.value = withTiming(0, { duration: 150 });
				if (onPressGithub) {
					runOnJS(onPressGithub)();
				}
			} else if (isPointInRect(x, y, button3Rect)) {
				button3Pressed.value = withTiming(0, { duration: 150 });
				if (onPressChat) {
					runOnJS(onPressChat)();
				}
			} else {
				// Reset all button states if touch ends outside any button
				button1Pressed.value = withTiming(0, { duration: 150 });
				button2Pressed.value = withTiming(0, { duration: 150 });
				button3Pressed.value = withTiming(0, { duration: 150 });
			}
		});

	// Combine gestures
	const gesture = Gesture.Simultaneous(panGesture, tapGesture);

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
	const titleFont = useFont(Epilogue_700Bold, 36);
	const subtitleFont = useFont(Epilogue_500Medium, 18);
	const smallFont = useFont(Epilogue_700Bold, 12);

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

	// Using the same transform properties as the previous price/button for our LinkedIn buttons
	const buttonsTransform = useDerivedValue(() => {
		return [
			{ translateX: width / 2 },
			{ translateY: height / 2 },
			{ perspective: 400 },
			{ rotateX: rotateX.value },
			{ rotateY: rotateY.value },
			// Maximum offset for buttons to appear highest
			{ translateX: -width / 2 + rotateY.value * 100 },
			{ translateY: -height / 2 - rotateX.value * 100 },
			// Add significant scale adjustment for depth
			{
				scale:
					1 + Math.abs(rotateX.value) * 0.08 + Math.abs(rotateY.value) * 0.08,
			},
		];
	});

	// Derived button transforms that include press state
	const button1Transform = useDerivedValue(() => {
		const buttonCenterX = FIRST_BUTTON_X + BUTTON_SIZE / 2;
		const buttonCenterY = BUTTON_Y + BUTTON_SIZE / 2;
		return [
			...buttonsTransform.value,
			// Move to button center, scale, then move back
			{ translateX: buttonCenterX },
			{ translateY: buttonCenterY },
			{ scale: 1 - button1Pressed.value * 0.1 },
			{ translateX: -buttonCenterX },
			{ translateY: -buttonCenterY },
		];
	});

	const button2Transform = useDerivedValue(() => {
		const buttonCenterX =
			FIRST_BUTTON_X + BUTTON_SIZE + BUTTONS_GAP + BUTTON_SIZE / 2;
		const buttonCenterY = BUTTON_Y + BUTTON_SIZE / 2;
		return [
			...buttonsTransform.value,
			// Move to button center, scale, then move back
			{ translateX: buttonCenterX },
			{ translateY: buttonCenterY },
			{ scale: 1 - button2Pressed.value * 0.1 },
			{ translateX: -buttonCenterX },
			{ translateY: -buttonCenterY },
		];
	});

	const button3Transform = useDerivedValue(() => {
		const buttonCenterX =
			FIRST_BUTTON_X + (BUTTON_SIZE + BUTTONS_GAP) * 2 + BUTTON_SIZE / 2;
		const buttonCenterY = BUTTON_Y + BUTTON_SIZE / 2;
		return [
			...buttonsTransform.value,
			// Move to button center, scale, then move back
			{ translateX: buttonCenterX },
			{ translateY: buttonCenterY },
			{ scale: 1 - button3Pressed.value * 0.1 },
			{ translateX: -buttonCenterX },
			{ translateY: -buttonCenterY },
		];
	});

	return (
		<GestureHandlerRootView style={styles.container}>
			<GestureDetector gesture={gesture}>
				<Canvas style={styles.canvas}>
					{/* Background mesh gradient */}
					<MeshGradientCore rows={3} cols={3} colors={palette} play />

					{/* Card with blur effect - using the custom BlurMask that requires a matrix */}
					<BackdropFilter filter={<BlurMask matrix={cardMatrix} />} clip={clip}>
						<Fill color="rgba(255, 255, 255, 0.5)" />
					</BackdropFilter>

					{/* Add border around the card */}
					<Group transform={titleTransform}>
						<Path
							path={roundedRectPath}
							color={CARD_BORDER_COLOR}
							style="stroke"
							strokeWidth={2}
						/>
					</Group>

					{/* Title with shadow */}
					<Group transform={titleTransform}>
						<Text
							x={
								width / 2 -
								(titleFont?.measureText("Lisa-Lou Kara").width ?? 0) / 2
							}
							y={CONTENT_Y}
							text="Lisa-Lou Kara"
							font={titleFont}
							color={PRIMARY_TEXT_COLOR}
							opacity={
								1 -
								Math.abs(rotateX.value) * 0.1 -
								Math.abs(rotateY.value) * 0.1
							}
						/>
						{/* React Native in blue */}
						<Text
							x={
								width / 2 -
								(subtitleFont?.measureText("React Native Developer").width ??
									0) /
									2
							}
							y={CONTENT_Y + 30}
							text="React Native"
							font={subtitleFont}
							color={SECONDARY_TEXT_COLOR}
							opacity={
								1 -
								Math.abs(rotateX.value) * 0.1 -
								Math.abs(rotateY.value) * 0.1
							}
						/>
						{/* Developer in black */}
						<Text
							x={
								width / 2 -
								(subtitleFont?.measureText("React Native Developer").width ??
									0) /
									2 +
								(subtitleFont?.measureText("React Native").width ?? 0)
							}
							y={CONTENT_Y + 30}
							text=" Developer"
							font={subtitleFont}
							color={PRIMARY_TEXT_COLOR}
							opacity={
								1 -
								Math.abs(rotateX.value) * 0.1 -
								Math.abs(rotateY.value) * 0.1
							}
						/>
					</Group>

					{/* Card image */}
					<Group transform={titleTransform}>
						{image && (
							<SkiaImage
								image={image}
								x={(width - CARD_WIDTH) / 2}
								y={(height - CARD_HEIGHT) / 2 - 10}
								width={CARD_WIDTH}
								height={IMAGE_HEIGHT}
								fit="contain"
							/>
						)}
					</Group>

					{/* LinkedIn Button 1 with elevation effect */}
					<Group transform={button1Transform}>
						<RoundedRect
							x={FIRST_BUTTON_X}
							y={BUTTON_Y}
							width={BUTTON_SIZE}
							height={BUTTON_SIZE}
							r={12}
							color={BUTTON_BG_COLOR}
							style="fill"
						/>
						<RoundedRect
							x={FIRST_BUTTON_X}
							y={BUTTON_Y}
							width={BUTTON_SIZE}
							height={BUTTON_SIZE}
							r={12}
							color={BUTTON_BORDER_COLOR}
							style="stroke"
							strokeWidth={1.5}
						/>
						{/* Button 1 icon */}
						{linkedInIcon && (
							<SkiaImage
								image={linkedInIcon}
								x={FIRST_BUTTON_X + (BUTTON_SIZE - ICON_SIZE) / 2}
								y={BUTTON_Y + ICON_PADDING + 5}
								width={ICON_SIZE}
								height={ICON_SIZE}
								fit="contain"
								opacity={0.8}
							/>
						)}
						{/* Button 1 text */}
						<Text
							x={
								FIRST_BUTTON_X +
								(BUTTON_SIZE - (smallFont?.measureText("Connect").width ?? 0)) /
									2
							}
							y={BUTTON_Y + ICON_SIZE + ICON_PADDING * 2 + 14}
							text="Connect"
							font={smallFont}
							color={BUTTON_TEXT_COLOR}
						/>
						<Text
							x={
								FIRST_BUTTON_X +
								(BUTTON_SIZE - (smallFont?.measureText("with me").width ?? 0)) /
									2
							}
							y={BUTTON_Y + ICON_SIZE + ICON_PADDING * 2 + 30}
							text="with me"
							font={smallFont}
							color={BUTTON_TEXT_COLOR}
						/>
					</Group>

					{/* Github Button 2 with elevation effect */}
					<Group transform={button2Transform}>
						<RoundedRect
							x={FIRST_BUTTON_X + BUTTON_SIZE + BUTTONS_GAP}
							y={BUTTON_Y}
							width={BUTTON_SIZE}
							height={BUTTON_SIZE}
							r={12}
							color={BUTTON_BG_COLOR}
							style="fill"
						/>
						<RoundedRect
							x={FIRST_BUTTON_X + BUTTON_SIZE + BUTTONS_GAP}
							y={BUTTON_Y}
							width={BUTTON_SIZE}
							height={BUTTON_SIZE}
							r={12}
							color={BUTTON_BORDER_COLOR}
							style="stroke"
							strokeWidth={1.5}
						/>
						{/* Button 2 icon */}
						{githubIcon && (
							<SkiaImage
								image={githubIcon}
								x={
									FIRST_BUTTON_X +
									BUTTON_SIZE +
									BUTTONS_GAP +
									(BUTTON_SIZE - ICON_SIZE) / 2
								}
								y={BUTTON_Y + ICON_PADDING + 5}
								width={ICON_SIZE}
								height={ICON_SIZE}
								fit="contain"
								opacity={0.8}
							/>
						)}
						{/* Button 2 text */}
						<Text
							x={
								FIRST_BUTTON_X +
								BUTTON_SIZE +
								BUTTONS_GAP +
								(BUTTON_SIZE - (smallFont?.measureText("Show me").width ?? 0)) /
									2
							}
							y={BUTTON_Y + ICON_SIZE + ICON_PADDING * 2 + 14}
							text="Show me"
							font={smallFont}
							color={BUTTON_TEXT_COLOR}
						/>
						<Text
							x={
								FIRST_BUTTON_X +
								BUTTON_SIZE +
								BUTTONS_GAP +
								(BUTTON_SIZE -
									(smallFont?.measureText("the code !").width ?? 0)) /
									2
							}
							y={BUTTON_Y + ICON_SIZE + ICON_PADDING * 2 + 30}
							text="the code !"
							font={smallFont}
							color={BUTTON_TEXT_COLOR}
						/>
					</Group>

					{/* Chat Button 3 with elevation effect */}
					<Group transform={button3Transform}>
						<RoundedRect
							x={FIRST_BUTTON_X + (BUTTON_SIZE + BUTTONS_GAP) * 2}
							y={BUTTON_Y}
							width={BUTTON_SIZE}
							height={BUTTON_SIZE}
							r={12}
							color={BUTTON_BG_COLOR}
							style="fill"
						/>
						<RoundedRect
							x={FIRST_BUTTON_X + (BUTTON_SIZE + BUTTONS_GAP) * 2}
							y={BUTTON_Y}
							width={BUTTON_SIZE}
							height={BUTTON_SIZE}
							r={12}
							color={BUTTON_BORDER_COLOR}
							style="stroke"
							strokeWidth={1.5}
						/>
						{/* Button 3 icon */}
						{chatIcon && (
							<SkiaImage
								image={chatIcon}
								x={
									FIRST_BUTTON_X +
									(BUTTON_SIZE + BUTTONS_GAP) * 2 +
									(BUTTON_SIZE - ICON_SIZE) / 2
								}
								y={BUTTON_Y + ICON_PADDING + 5}
								width={ICON_SIZE}
								height={ICON_SIZE}
								fit="contain"
								opacity={0.8}
							/>
						)}
						{/* Button 3 text */}
						<Text
							x={
								FIRST_BUTTON_X +
								(BUTTON_SIZE + BUTTONS_GAP) * 2 +
								(BUTTON_SIZE - (smallFont?.measureText("Chat").width ?? 0)) / 2
							}
							y={BUTTON_Y + ICON_SIZE + ICON_PADDING * 2 + 14}
							text="Chat"
							font={smallFont}
							color={BUTTON_TEXT_COLOR}
						/>
						<Text
							x={
								FIRST_BUTTON_X +
								(BUTTON_SIZE + BUTTONS_GAP) * 2 +
								(BUTTON_SIZE - (smallFont?.measureText("with me").width ?? 0)) /
									2
							}
							y={BUTTON_Y + ICON_SIZE + ICON_PADDING * 2 + 30}
							text="with me"
							font={smallFont}
							color={BUTTON_TEXT_COLOR}
						/>
					</Group>
				</Canvas>
			</GestureDetector>
		</GestureHandlerRootView>
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
