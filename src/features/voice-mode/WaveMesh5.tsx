import { Canvas, Group, Path, Skia } from "@shopify/react-native-skia";
import { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
	Easing,
	useDerivedValue,
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

interface WaveMesh5Props {
	radius?: number;
	pointCount?: number;
	color?: string;
	waveIntensity?: number;
	waveSpeed?: number;
	rotationSpeed?: number;
	colorThreshold?: number;
}

export function WaveMesh5({
	radius = 100,
	pointCount = 1000,
	color = "#FF00FF",
	waveIntensity = 15,
	waveSpeed = 2000,
	rotationSpeed = 20000,
	colorThreshold = 0.3,
}: WaveMesh5Props) {
	const { width, height } = useWindowDimensions();
	const centerX = width / 2;
	const centerY = height / 2;

	const progress1 = useSharedValue(0);
	const progress2 = useSharedValue(0);
	const progress3 = useSharedValue(0);

	const rotationX = useSharedValue(0);
	const rotationY = useSharedValue(0);
	const rotationZ = useSharedValue(0);

	// Memoize animation configurations
	const animations = useMemo(
		() => ({
			wave1: {
				duration: waveSpeed,
				easing: Easing.linear,
			},
			wave2: {
				duration: waveSpeed * 1.5,
				easing: Easing.linear,
			},
			wave3: {
				duration: waveSpeed * 0.7,
				easing: Easing.linear,
			},
		}),
		[waveSpeed],
	);

	useEffect(() => {
		progress1.value = 0;
		progress2.value = 0;
		progress3.value = 0;
		rotationX.value = 0;
		rotationY.value = 0;
		rotationZ.value = 0;

		const animation1 = withRepeat(withTiming(1, animations.wave1), -1, false);
		const animation2 = withRepeat(withTiming(1, animations.wave2), -1, false);
		const animation3 = withRepeat(withTiming(1, animations.wave3), -1, false);

		progress1.value = animation1;
		progress2.value = animation2;
		progress3.value = animation3;

		const baseRotationDuration = rotationSpeed;

		rotationX.value = withRepeat(
			withTiming(Math.PI * 2, {
				duration: baseRotationDuration,
				easing: Easing.linear,
			}),
			-1,
			false,
		);

		rotationY.value = withRepeat(
			withTiming(Math.PI * 2, {
				duration: baseRotationDuration * 0.8,
				easing: Easing.linear,
			}),
			-1,
			false,
		);

		rotationZ.value = withRepeat(
			withTiming(Math.PI * 2, {
				duration: baseRotationDuration * 0.6,
				easing: Easing.linear,
			}),
			-1,
			false,
		);

		return () => {
			progress1.value = 0;
			progress2.value = 0;
			progress3.value = 0;
			rotationX.value = 0;
			rotationY.value = 0;
			rotationZ.value = 0;
		};
	}, [
		animations,
		progress1,
		progress2,
		progress3,
		rotationX,
		rotationY,
		rotationZ,
		rotationSpeed,
	]);

	// Memoize sphere points generation
	const spherePoints = useMemo(() => {
		const phi = Math.PI * (3 - Math.sqrt(5));
		const pointsArray = new Array(pointCount).fill(0);

		return pointsArray.map((_, i) => {
			const y = 1 - (i / (pointCount - 1)) * 2;
			const radiusAtY = Math.sqrt(1 - y * y);
			const theta = phi * i;

			const x = Math.cos(theta) * radiusAtY;
			const z = Math.sin(theta) * radiusAtY;

			return {
				x: x * radius + centerX,
				y: y * radius + centerY,
				z: z * radius,
				originalX: x * radius,
				originalY: y * radius,
				originalZ: z * radius,
			};
		});
	}, [radius, pointCount, centerX, centerY]);

	// Add color interpolation helper
	const interpolateColor = useCallback(
		(baseColor: string, opacity: number) => {
			"worklet";
			const r = Number.parseInt(baseColor.slice(1, 3), 16);
			const g = Number.parseInt(baseColor.slice(3, 5), 16);
			const b = Number.parseInt(baseColor.slice(5, 7), 16);

			if (opacity > colorThreshold) {
				const t = (opacity - colorThreshold) / (1 - colorThreshold);
				const targetR = r + (255 - r) * 0.7;
				const targetG = g + (255 - g) * 0.7;
				const targetB = b + (255 - b) * 0.7;

				const newR = Math.round(r + (targetR - r) * t);
				const newG = Math.round(g + (targetG - g) * t);
				const newB = Math.round(b + (targetB - b) * t);

				return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
			}

			return baseColor;
		},
		[colorThreshold],
	);

	// Create a derived value for the entire path
	const pathValue = useDerivedValue(() => {
		"worklet";
		const path = Skia.Path.Make();

		const rotatePoint = (x: number, y: number, z: number) => {
			// Rotate around X axis
			const cosX = Math.cos(rotationX.value);
			const sinX = Math.sin(rotationX.value);
			const y1 = y * cosX - z * sinX;
			const z1 = y * sinX + z * cosX;

			// Rotate around Y axis
			const cosY = Math.cos(rotationY.value);
			const sinY = Math.sin(rotationY.value);
			const x2 = x * cosY + z1 * sinY;
			const z2 = -x * sinY + z1 * cosY;

			// Rotate around Z axis
			const cosZ = Math.cos(rotationZ.value);
			const sinZ = Math.sin(rotationZ.value);
			const x3 = x2 * cosZ - y1 * sinZ;
			const y3 = x2 * sinZ + y1 * cosZ;

			return { x: x3, y: y3, z: z2 };
		};

		const calculateWave = (point: Point3D, progress: number, angle: number) => {
			const x = point.originalX / radius;
			const y = point.originalY / radius;
			const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
			return (
				Math.sin(rotatedY * Math.PI * 2 + progress * Math.PI * 2) *
				waveIntensity
			);
		};

		// biome-ignore lint/complexity/noForEach: <explanation>
		spherePoints.forEach((point) => {
			const wave1 = calculateWave(point, progress1.value, 0);
			const wave2 = calculateWave(point, progress2.value, Math.PI / 3);
			const wave3 = calculateWave(point, progress3.value, -Math.PI / 4);
			const totalOffset = (wave1 + wave2 + wave3) / 2;

			const rotated = rotatePoint(
				point.originalX,
				point.originalY,
				point.originalZ,
			);

			const x = rotated.x + centerX + totalOffset * (point.originalX / radius);
			const y = rotated.y + centerY + totalOffset * (point.originalY / radius);

			// Calculate opacity based on Z position
			const normalizedZ = (rotated.z + radius) / (2 * radius);
			const contrast = 2.5;
			const minOpacity = 0.05;
			const maxOpacity = 1;
			const opacity = Math.max(
				minOpacity,
				normalizedZ ** contrast * maxOpacity,
			);

			// Get color based on opacity
			const pointColor = interpolateColor(color, opacity);

			// Create a tiny line for each point (more efficient than circles)
			path.moveTo(x, y);
			path.lineTo(x + 1, y + 1);
		});

		return path;
	}, [spherePoints, color, radius, centerX, centerY, waveIntensity]);

	return (
		<Canvas style={styles.canvas}>
			<Group>
				<Path
					path={pathValue}
					color={color}
					style="stroke"
					strokeWidth={1}
					strokeCap="round"
				/>
			</Group>
		</Canvas>
	);
}

const styles = StyleSheet.create({
	canvas: {
		flex: 1,
	},
});
