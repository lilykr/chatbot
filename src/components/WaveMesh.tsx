import { Canvas, Points, vec } from "@shopify/react-native-skia";
import { useCallback, useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import {
	Easing,
	useAnimatedReaction,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

interface WaveMeshProps {
	color?: string;
	pointCount?: number;
	amplitude?: number;
	frequency?: number;
	isAnimating?: boolean;
}

export function WaveMesh({
	color = "#AC1ED6",
	pointCount = 1000,
	amplitude = 100,
	frequency = 0.01,
	isAnimating = true,
}: WaveMeshProps) {
	const { width, height } = useWindowDimensions();
	const phase = useSharedValue(0);

	// Create points in a grid pattern
	const createPoints = useCallback(() => {
		const points = [];
		const rows = Math.sqrt(pointCount);
		const cols = rows;

		// Use 80% of the screen width/height to ensure visibility
		const size = Math.min(width, height) * 0.8;
		const spacing = size / cols;

		// Calculate starting position to center the grid
		const startX = (width - size) / 2;
		const startY = (height - size) / 2;

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const x = startX + j * spacing;
				const y = startY + i * spacing;
				points.push(vec(x, y));
			}
		}
		return points;
	}, [pointCount, width, height]);

	// Animate the phase
	useEffect(() => {
		if (isAnimating) {
			phase.value = withRepeat(
				withTiming(Math.PI * 2, {
					duration: 3000,
					easing: Easing.linear,
				}),
				-1,
				false,
			);
		}
	}, [isAnimating, phase]);

	// Update points positions based on phase
	const points = useSharedValue(createPoints());

	useAnimatedReaction(
		() => phase.value,
		(currentPhase) => {
			const newPoints = points.value.map((point, index) => {
				const row = Math.floor(index / Math.sqrt(pointCount));
				const centerX = width / 2;
				const centerY = height / 2;
				const distanceFromCenter = Math.sqrt(
					(point.x - centerX) ** 2 + (point.y - centerY) ** 2,
				);

				// Create a wave effect with reduced amplitude for tighter control
				const waveOffset =
					Math.sin(distanceFromCenter * frequency + currentPhase) *
					(amplitude * 0.5);

				// Add some vertical movement based on row with reduced amplitude
				const verticalOffset = Math.sin(row * 0.1 + currentPhase) * 10;

				// Add subtle horizontal movement
				const horizontalOffset = Math.cos(currentPhase + index * 0.01) * 5;

				return vec(
					point.x + horizontalOffset,
					point.y + waveOffset + verticalOffset,
				);
			});

			points.value = newPoints;
		},
		[],
	);

	return (
		<View style={styles.container}>
			<Canvas style={styles.canvas}>
				<Points
					points={points}
					mode="points"
					color={color}
					style="fill"
					strokeWidth={8}
					strokeCap="round"
					blendMode="screen"
				/>
			</Canvas>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
	canvas: {
		flex: 1,
		backgroundColor: "transparent",
	},
});
