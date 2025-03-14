import { Canvas, Circle, Group } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { View } from "react-native";
import {
	Easing,
	useDerivedValue,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

interface Point3D {
	phi: number;
	theta: number;
}

interface WaveMesh3Props {
	width?: number;
	height?: number;
	radius?: number;
	pointCount?: number;
	color?: string;
	waveIntensity?: number;
	waveSpeed?: number;
	rotationSpeed?: number;
	rotationDirection?: { x: number; y: number };
}

export function WaveMesh3({
	width = 300,
	height = 300,
	radius = 150,
	pointCount = 2500,
	color = "#FF00FF",
	waveIntensity = 15,
	waveSpeed = 1,
	rotationSpeed = 1,
	rotationDirection = { x: 1, y: 0.5 }, // Default rotation direction
}: WaveMesh3Props) {
	// Animation progress
	const time = useSharedValue(0);
	const rotation = useSharedValue(0);

	// Start the animations
	useEffect(() => {
		time.value = 0;
		time.value = withRepeat(
			withTiming(2 * Math.PI, {
				duration: 2000 / waveSpeed,
				easing: Easing.linear,
			}),
			-1,
			false,
		);

		rotation.value = 0;
		rotation.value = withRepeat(
			withTiming(2 * Math.PI, {
				duration: 3000 / rotationSpeed,
				easing: Easing.linear,
			}),
			-1,
			false,
		);
	}, [waveSpeed, rotationSpeed, time, rotation]);

	// Generate base points
	const generatePoints = (): Point3D[] => {
		const points: Point3D[] = [];
		const numRings = Math.sqrt(pointCount / 2);
		const phiStep = Math.PI / 2 / numRings;

		for (let ring = 0; ring < numRings; ring++) {
			const phi = ring * phiStep;
			const ringRadius = Math.sin(phi);
			const pointsInRing = Math.max(6, Math.floor(numRings * ringRadius * 2));
			const thetaStep = (2 * Math.PI) / pointsInRing;

			for (let p = 0; p < pointsInRing; p++) {
				const theta = p * thetaStep;
				points.push({ phi, theta });
			}
		}
		return points;
	};

	const basePoints = generatePoints();

	return (
		<View style={{ width, height }}>
			<Canvas style={{ flex: 1 }}>
				<Group>
					{basePoints.map((point, i) => {
						const cx = useDerivedValue(() => {
							// Apply wave effect
							const wave =
								Math.sin(point.theta * 3 + time.value) *
								Math.sin(point.phi * 2) *
								waveIntensity;

							// Apply rotation
							const rotatedTheta =
								point.theta + rotation.value * rotationDirection.x;
							const rotatedPhi =
								point.phi + rotation.value * rotationDirection.y;

							const waveRadius = radius + wave;

							// Calculate position with rotation
							return (
								waveRadius * Math.sin(rotatedPhi) * Math.cos(rotatedTheta) +
								width / 2
							);
						});

						const cy = useDerivedValue(() => {
							// Apply wave effect
							const wave =
								Math.sin(point.theta * 3 + time.value) *
								Math.sin(point.phi * 2) *
								waveIntensity;

							// Apply rotation
							const rotatedTheta =
								point.theta + rotation.value * rotationDirection.x;
							const rotatedPhi =
								point.phi + rotation.value * rotationDirection.y;

							const waveRadius = radius + wave;

							// Calculate position with rotation
							return (
								waveRadius * Math.sin(rotatedPhi) * Math.sin(rotatedTheta) +
								height / 2
							);
						});

						const opacity = useDerivedValue(() => {
							const distanceFromCenter = Math.sqrt(
								(cx.value - width / 2) ** 2 + (cy.value - height / 2) ** 2,
							);
							return (1 - distanceFromCenter / radius) ** 1.5;
						});

						return (
							<Circle
								key={`${point.phi}-${point.theta}`}
								cx={cx}
								cy={cy}
								r={1.5}
								opacity={opacity}
								color={color}
							/>
						);
					})}
				</Group>
			</Canvas>
		</View>
	);
}
