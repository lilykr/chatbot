import {
	Canvas,
	Group,
	Path,
	type SkPath,
	Skia,
} from "@shopify/react-native-skia";
import { useCallback, useEffect } from "react";
import { type LayoutChangeEvent, StyleSheet } from "react-native";
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

// Add shape type to props
type ShapeType = "circle" | "cross" | "star";

interface WaveMeshProps {
	radius?: number;
	pointCount?: number;
	color?: string;
	waveIntensity: SharedValue<number>;
	waveSpeed: SharedValue<number>;
	rotationSpeed: SharedValue<number>;
	colorThreshold?: number;
	crossSize?: number;
	shape?: ShapeType; // New prop for shape configuration
	width?: number; // Add width prop
	height?: number; // Add height prop
}

export function WaveMesh({
	radius = 120,
	pointCount = 2000,
	color = "#FF00FF",
	waveIntensity,
	waveSpeed,
	rotationSpeed,
	colorThreshold = 0.2,
	crossSize = 3.5,
	shape = "star",
	width, // Accept width prop
	height, // Accept height prop
}: WaveMeshProps) {
	// Use provided dimensions or default to 0 (will be measured)
	const canvasWidth = useSharedValue(width || 0);
	const canvasHeight = useSharedValue(height || 0);

	// Calculate center based on canvas dimensions
	const centerX = useDerivedValue(() => canvasWidth.value / 2);
	const centerY = useDerivedValue(() => canvasHeight.value / 2);

	// Add these shared values to track total rotation
	const totalRotationX = useSharedValue(0);
	const totalRotationY = useSharedValue(0);
	const totalRotationZ = useSharedValue(0);

	// Track the previous time for more accurate calculation
	const lastTime = useSharedValue(Date.now());

	// Add these shared values to smoothly track all effective speeds
	const effectiveRotationSpeed = useSharedValue(rotationSpeed.value);
	const effectiveWaveSpeed = useSharedValue(waveSpeed.value);
	const effectiveWaveIntensity = useSharedValue(waveIntensity.value);

	// Add phase tracking for wave animations to avoid discontinuities
	const phase1 = useSharedValue(0);
	const phase2 = useSharedValue(0);
	const phase3 = useSharedValue(0);

	// Handle canvas layout to get dimensions if not provided
	const onCanvasLayout = useCallback(
		(event: LayoutChangeEvent) => {
			const { width: layoutWidth, height: layoutHeight } =
				event.nativeEvent.layout;

			// Only update if dimensions weren't provided as props
			if (!width) {
				canvasWidth.value = layoutWidth;
			}
			if (!height) {
				canvasHeight.value = layoutHeight;
			}
		},
		[width, height, canvasWidth, canvasHeight],
	);

	// Replace the updateAnimations function with this setup
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const interval = setInterval(() => {
			runOnUI(() => {
				"worklet";
				const now = Date.now();
				const deltaTime = Math.min((now - lastTime.value) / 1000, 0.05);
				lastTime.value = now;

				// Use different interpolation factors for speeding up vs slowing down
				// Faster transitions when accelerating (low to high volume)
				const speedUpFactor = 0.15; // Much faster acceleration (3x the original)
				const slowDownFactor = 0.05; // Keep the original slow deceleration

				// Adaptive interpolation based on direction of change
				const rotationSpeedDelta =
					rotationSpeed.value - effectiveRotationSpeed.value;
				const waveSpeedDelta = waveSpeed.value - effectiveWaveSpeed.value;
				const waveIntensityDelta =
					waveIntensity.value - effectiveWaveIntensity.value;

				// For rotation speed: faster adaptation when speeding up (lower values = faster rotation)
				const rotationFactor =
					rotationSpeedDelta < 0 ? speedUpFactor : slowDownFactor;
				// For wave speed: faster adaptation when speeding up (lower values = faster waves)
				const waveSpeedFactor =
					waveSpeedDelta < 0 ? speedUpFactor : slowDownFactor;
				// For wave intensity: faster adaptation when increasing intensity
				const intensityFactor =
					waveIntensityDelta > 0 ? speedUpFactor : slowDownFactor;

				// Apply the appropriate interpolation factors
				effectiveRotationSpeed.value += rotationSpeedDelta * rotationFactor;
				effectiveWaveSpeed.value += waveSpeedDelta * waveSpeedFactor;
				effectiveWaveIntensity.value += waveIntensityDelta * intensityFactor;

				// Safety floors
				const safeRotationSpeed = Math.max(effectiveRotationSpeed.value, 1000);
				const safeWaveSpeed = Math.max(effectiveWaveSpeed.value, 1000);

				// Calculate continuous phases for wave animations
				const phaseIncrement1 =
					(2 * Math.PI * deltaTime) / (safeWaveSpeed / 1000);
				const phaseIncrement2 =
					(2 * Math.PI * deltaTime) / ((safeWaveSpeed * 1.5) / 1000);
				const phaseIncrement3 =
					(2 * Math.PI * deltaTime) / ((safeWaveSpeed * 0.7) / 1000);

				// Update continuous phases
				phase1.value = (phase1.value + phaseIncrement1) % (2 * Math.PI);
				phase2.value = (phase2.value + phaseIncrement2) % (2 * Math.PI);
				phase3.value = (phase3.value + phaseIncrement3) % (2 * Math.PI);

				// Rotation calculations with rate limiting
				const maxRotationPerFrame = Math.PI / 10; // More conservative limit

				const xIncrement =
					(2 * Math.PI * deltaTime) / (safeRotationSpeed / 1000);
				const yIncrement =
					(2 * Math.PI * deltaTime) / ((safeRotationSpeed * 0.8) / 1000);
				const zIncrement =
					(2 * Math.PI * deltaTime) / ((safeRotationSpeed * 0.6) / 1000);

				totalRotationX.value +=
					Math.min(Math.abs(xIncrement), maxRotationPerFrame) *
					Math.sign(xIncrement);
				totalRotationY.value +=
					Math.min(Math.abs(yIncrement), maxRotationPerFrame) *
					Math.sign(yIncrement);
				totalRotationZ.value +=
					Math.min(Math.abs(zIncrement), maxRotationPerFrame) *
					Math.sign(zIncrement);
			})();
		}, 16);

		return () => clearInterval(interval);
	}, []);

	// Replace the progress calculations with phase-based values
	const progress1 = useDerivedValue(() => phase1.value / (2 * Math.PI));
	const progress2 = useDerivedValue(() => phase2.value / (2 * Math.PI));
	const progress3 = useDerivedValue(() => phase3.value / (2 * Math.PI));

	// Replace your rotation derived values with these
	const rotationX = useDerivedValue(() => totalRotationX.value);
	const rotationY = useDerivedValue(() => totalRotationY.value);
	const rotationZ = useDerivedValue(() => totalRotationZ.value);

	// Memoize sphere points generation - now using centerX and centerY as derived values
	const spherePoints = useDerivedValue(() => {
		"worklet";
		const phi = Math.PI * (3 - Math.sqrt(5));
		const pointsArray = new Array(pointCount).fill(0);

		return pointsArray.map((_, i) => {
			const y = 1 - (i / (pointCount - 1)) * 2;
			const radiusAtY = Math.sqrt(1 - y * y);
			const theta = phi * i;

			const x = Math.cos(theta) * radiusAtY;
			const z = Math.sin(theta) * radiusAtY;

			return {
				x: x * radius + centerX.value,
				y: y * radius + centerY.value,
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
				effectiveWaveIntensity.value
			);
		};

		for (const point of spherePoints.value) {
			const wave1 = calculateWave(point, progress1.value, 0);
			const wave2 = calculateWave(point, progress2.value, Math.PI / 3);
			const wave3 = calculateWave(point, progress3.value, -Math.PI / 4);
			const totalOffset = (wave1 + wave2 + wave3) / 2;

			const rotated = rotatePoint(
				point.originalX,
				point.originalY,
				point.originalZ,
			);

			const x =
				rotated.x + centerX.value + totalOffset * (point.originalX / radius);
			const y =
				rotated.y + centerY.value + totalOffset * (point.originalY / radius);

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

	// Function to draw different shapes on the path
	const drawShape = useCallback(
		(
			path: SkPath,
			x: number,
			y: number,
			size: number,
			shapeType: ShapeType,
		) => {
			"worklet";
			const halfSize = size / 2;

			switch (shapeType) {
				case "circle":
					// Draw a circle
					path.addCircle(x, y, halfSize);
					break;

				case "cross":
					// Draw a cross (current implementation)
					path.moveTo(x - halfSize, y);
					path.lineTo(x + halfSize, y);
					path.moveTo(x, y - halfSize);
					path.lineTo(x, y + halfSize);
					break;

				case "star":
					// Draw a 4-pointed star
					// biome-ignore lint/correctness/noSwitchDeclarations: <explanation>
					const innerSize = halfSize * 0.4; // Inner radius of the star

					// Main points
					path.moveTo(x, y - halfSize); // Top
					path.lineTo(x + innerSize, y - innerSize); // Top-right inner
					path.lineTo(x + halfSize, y); // Right
					path.lineTo(x + innerSize, y + innerSize); // Bottom-right inner
					path.lineTo(x, y + halfSize); // Bottom
					path.lineTo(x - innerSize, y + innerSize); // Bottom-left inner
					path.lineTo(x - halfSize, y); // Left
					path.lineTo(x - innerSize, y - innerSize); // Top-left inner
					path.close(); // Back to top
					break;
			}
		},
		[],
	);

	const basePathValue = useDerivedValue(() => {
		"worklet";
		const path = Skia.Path.Make();

		for (const { x, y, opacity } of pathCalculation.value) {
			const lineLength = opacity * crossSize;
			drawShape(path, x, y, lineLength, shape);
		}

		return path;
	}, [pathCalculation, crossSize, shape, drawShape]);

	const whitePathValue = useDerivedValue(() => {
		"worklet";
		const path = Skia.Path.Make();

		for (const { x, y, whiteness } of pathCalculation.value) {
			if (whiteness > 0) {
				const lineLength = whiteness * (crossSize * 0.8);
				drawShape(path, x, y, lineLength, shape);
			}
		}

		return path;
	}, [pathCalculation, crossSize, shape, drawShape]);

	// Adjust the style based on shape type
	const pathStyle = shape === "circle" ? "fill" : "stroke";

	return (
		<Canvas style={styles.canvas} onLayout={onCanvasLayout}>
			<Group>
				<Path
					path={basePathValue}
					color={color}
					style={pathStyle}
					strokeWidth={1}
					strokeCap="round"
				/>
				<Path
					path={whitePathValue}
					color="white"
					style={pathStyle}
					strokeWidth={0.9}
					strokeCap="round"
					opacity={0.95}
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
