import { Canvas, Group, Path, Skia } from "@shopify/react-native-skia";
import { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
	type SharedValue,
	runOnUI,
	useDerivedValue,
	useSharedValue,
} from "react-native-reanimated";

interface Point3D {
	x: number;
	y: number;
	z: number;
	originalX: number;
	originalY: number;
	originalZ: number;
}

interface WaveMeshProps {
	radius?: number;
	pointCount?: number;
	color?: string;
	waveIntensity: SharedValue<number>;
	waveSpeed: SharedValue<number>;
	rotationSpeed: SharedValue<number>;
	colorThreshold?: number;
	crossSize?: number;
}

export function WaveMesh({
	radius = 120,
	pointCount = 2000,
	color = "#FF00FF",
	waveIntensity,
	waveSpeed,
	rotationSpeed,
	colorThreshold = 0.2,
	crossSize = 4,
}: WaveMeshProps) {
	const { width, height } = useWindowDimensions();
	const centerX = width / 2;
	const centerY = height / 2;

	// Use a global clock that continuously runs
	const clock = useSharedValue(0);

	// Replace the updateAnimations function with this setup
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const interval = setInterval(() => {
			runOnUI(() => {
				"worklet";
				clock.value += 1 / 60; // Increment by approximate frame time
			})();
		}, 16); // ~60fps

		return () => clearInterval(interval);
	}, []);

	// Derive all animation values from the clock
	const progress1 = useDerivedValue(() => {
		return (clock.value % (waveSpeed.value / 1000)) / (waveSpeed.value / 1000);
	});

	const progress2 = useDerivedValue(() => {
		return (
			(clock.value % ((waveSpeed.value * 1.5) / 1000)) /
			((waveSpeed.value * 1.5) / 1000)
		);
	});

	const progress3 = useDerivedValue(() => {
		return (
			(clock.value % ((waveSpeed.value * 0.7) / 1000)) /
			((waveSpeed.value * 0.7) / 1000)
		);
	});

	const rotationX = useDerivedValue(() => {
		return (
			((clock.value % (rotationSpeed.value / 1000)) /
				(rotationSpeed.value / 1000)) *
			Math.PI *
			2
		);
	});

	const rotationY = useDerivedValue(() => {
		return (
			((clock.value % ((rotationSpeed.value * 0.8) / 1000)) /
				((rotationSpeed.value * 0.8) / 1000)) *
			Math.PI *
			2
		);
	});

	const rotationZ = useDerivedValue(() => {
		return (
			((clock.value % ((rotationSpeed.value * 0.6) / 1000)) /
				((rotationSpeed.value * 0.6) / 1000)) *
			Math.PI *
			2
		);
	});

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

	const interpolateColor = useCallback(
		(opacity: number): { opacity: number; whiteness: number } => {
			"worklet";
			if (opacity > colorThreshold) {
				const t = (opacity - colorThreshold) / (1 - colorThreshold);
				return {
					opacity,
					whiteness: t * 0.7,
				};
			}
			return {
				opacity,
				whiteness: 0,
			};
		},
		[colorThreshold],
	);

	const pathCalculation = useDerivedValue(() => {
		"worklet";
		const points: Array<{
			x: number;
			y: number;
			opacity: number;
			whiteness: number;
		}> = [];

		const rotatePoint = (x: number, y: number, z: number) => {
			"worklet";
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
			"worklet";
			const x = point.originalX / radius;
			const y = point.originalY / radius;
			const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
			return (
				Math.sin(rotatedY * Math.PI * 2 + progress * Math.PI * 2) *
				waveIntensity.value
			);
		};

		for (const point of spherePoints) {
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

			const normalizedZ = (rotated.z + radius) / (2 * radius);
			const contrast = 3.5;
			const minOpacity = 0.02;
			const maxOpacity = 1;
			const opacity = Math.max(
				minOpacity,
				normalizedZ ** contrast * maxOpacity,
			);

			const { opacity: finalOpacity, whiteness } = interpolateColor(opacity);

			if (finalOpacity > 0.05) {
				points.push({
					x,
					y,
					opacity: finalOpacity,
					whiteness,
				});
			}
		}

		return points;
	}, [
		spherePoints,
		color,
		radius,
		centerX,
		centerY,
		waveIntensity,
		waveSpeed,
		rotationSpeed,
		progress1,
		progress2,
		progress3,
		rotationX,
		rotationY,
		rotationZ,
	]);

	const basePathValue = useDerivedValue(() => {
		"worklet";
		const path = Skia.Path.Make();

		for (const { x, y, opacity } of pathCalculation.value) {
			const lineLength = opacity * crossSize;
			const halfLength = lineLength / 2;
			path.moveTo(x - halfLength, y);
			path.lineTo(x + halfLength, y);
			path.moveTo(x, y - halfLength);
			path.lineTo(x, y + halfLength);
		}

		return path;
	}, [pathCalculation, crossSize]);

	const whitePathValue = useDerivedValue(() => {
		"worklet";
		const path = Skia.Path.Make();

		for (const { x, y, whiteness } of pathCalculation.value) {
			if (whiteness > 0) {
				const lineLength = whiteness * (crossSize * 0.8);
				const halfLength = lineLength / 2;
				path.moveTo(x - halfLength, y);
				path.lineTo(x + halfLength, y);
				path.moveTo(x, y - halfLength);
				path.lineTo(x, y + halfLength);
			}
		}

		return path;
	}, [pathCalculation, crossSize]);

	return (
		<Canvas style={styles.canvas}>
			<Group>
				<Path
					path={basePathValue}
					color={color}
					style="stroke"
					strokeWidth={1}
					strokeCap="round"
				/>
				<Path
					path={whitePathValue}
					color="white"
					style="stroke"
					strokeWidth={0.9}
					strokeCap="round"
					opacity={0.9}
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
