import { Canvas, Group, Points, vec } from "@shopify/react-native-skia";
import { useCallback, useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import {
	Easing,
	useAnimatedReaction,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

interface Point3D {
	x: number;
	y: number;
	z: number;
	originalX: number;
	originalY: number;
	originalZ: number;
}

interface WaveMesh2Props {
	color?: string;
	pointCount?: number;
	radius?: number;
	waveIntensity?: number;
	minScale?: number;
	maxScale?: number;
	rotationSpeed?: number;
	isAnimating?: boolean;
}

export function WaveMesh2({
	color = "#ff00ff",
	pointCount = 2500,
	radius = 150,
	waveIntensity = 0.3,
	minScale = 0.7,
	maxScale = 1.3,
	rotationSpeed = 1,
	isAnimating = true,
}: WaveMesh2Props) {
	const { width, height } = useWindowDimensions();
	const phase = useSharedValue(0);
	const phase2 = useSharedValue(0); // Second phase for complex waves
	const rotation = useSharedValue(0);

	// Create points in a spherical pattern using spherical coordinates
	const createPoints = useCallback(() => {
		const points: Point3D[] = [];
		// Use Fibonacci sphere distribution for uniform point spacing
		const goldenRatio = (1 + Math.sqrt(5)) / 2;
		const angleIncrement = Math.PI * 2 * goldenRatio;

		for (let i = 0; i < pointCount; i++) {
			const t = i / pointCount;
			const inclination = Math.acos(1 - 2 * t);
			const azimuth = angleIncrement * i;

			// Convert from spherical to cartesian coordinates
			const x = Math.sin(inclination) * Math.cos(azimuth);
			const y = Math.sin(inclination) * Math.sin(azimuth);
			const z = Math.cos(inclination);

			points.push({
				x: x * radius,
				y: y * radius,
				z: z * radius,
				originalX: x,
				originalY: y,
				originalZ: z,
			});
		}
		return points;
	}, [radius, pointCount]);

	// Initialize points
	const points3D = useSharedValue(createPoints());
	const points2D = useSharedValue(
		createPoints().map((p) => vec(width / 2, height / 2)),
	);

	// Animate the phases and rotation
	useEffect(() => {
		if (isAnimating) {
			// Main wave phase
			phase.value = withRepeat(
				withTiming(Math.PI * 2, {
					duration: 6000,
					easing: Easing.inOut(Easing.ease),
				}),
				-1,
				false,
			);

			// Secondary wave phase (faster)
			phase2.value = withRepeat(
				withTiming(Math.PI * 2, {
					duration: 4000,
					easing: Easing.inOut(Easing.ease),
				}),
				-1,
				false,
			);

			// Rotation
			rotation.value = withRepeat(
				withTiming(Math.PI * 2, {
					duration: 8000 / rotationSpeed,
					easing: Easing.linear,
				}),
				-1,
				false,
			);
		} else {
			phase.value = withTiming(0);
			phase2.value = withTiming(0);
			rotation.value = withTiming(0);
		}
	}, [isAnimating, rotationSpeed, phase, phase2, rotation]);

	// Update points positions based on phase and rotation
	useAnimatedReaction(
		() => ({
			phase: phase.value,
			phase2: phase2.value,
			rotation: rotation.value,
		}),
		(current) => {
			const { phase, phase2, rotation } = current;
			const cosRotation = Math.cos(rotation);
			const sinRotation = Math.sin(rotation);

			const newPoints = [];

			for (const point of points3D.value) {
				// Calculate various wave influences
				const distanceFromCenter = Math.sqrt(
					point.originalX ** 2 + point.originalY ** 2 + point.originalZ ** 2,
				);

				// Primary wave effect
				const wave1 = Math.sin(distanceFromCenter * 2 + phase) * waveIntensity;

				// Secondary wave effect (different frequency and phase)
				const wave2 =
					Math.sin(distanceFromCenter * 3 + phase2) * (waveIntensity * 0.5);

				// Vertical ripple effect
				const verticalWave =
					Math.sin(point.originalY * 4 + phase) * (waveIntensity * 0.3);

				// Horizontal spiral effect
				const spiralWave =
					Math.sin(Math.atan2(point.originalZ, point.originalX) * 3 + phase2) *
					(waveIntensity * 0.4);

				// Combine all wave effects
				const totalWave = wave1 + wave2 + verticalWave + spiralWave;
				const scaleFactor = Math.min(
					maxScale,
					Math.max(minScale, 1 + totalWave),
				);

				// Apply scaling and rotation
				const x = point.originalX * scaleFactor * radius;
				const y = point.originalY * scaleFactor * radius;
				const z = point.originalZ * scaleFactor * radius;

				// Rotate around Y axis
				const rotatedX = x * cosRotation - z * sinRotation;
				const rotatedZ = x * sinRotation + z * cosRotation;

				// Perspective projection
				const perspective = 600;
				const scale = perspective / (perspective + rotatedZ);

				// Project to 2D space
				newPoints.push(
					vec(width / 2 + rotatedX * scale, height / 2 + y * scale),
				);
			}

			points2D.value = newPoints;
		},
		[],
	);

	return (
		<View style={styles.container}>
			<Canvas style={styles.canvas}>
				<Group blendMode="screen">
					{/* Glow layer */}
					<Points
						points={points2D}
						mode="points"
						color={color}
						style="fill"
						strokeWidth={6}
						strokeCap="round"
					/>
					{/* Core white points */}
					<Points
						points={points2D}
						mode="points"
						color="white"
						style="fill"
						strokeWidth={2}
						strokeCap="round"
					/>
				</Group>
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
