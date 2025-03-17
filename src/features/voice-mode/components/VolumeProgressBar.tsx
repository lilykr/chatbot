import { Canvas, RoundedRect } from "@shopify/react-native-skia";
import { type SharedValue, useDerivedValue } from "react-native-reanimated";

interface VolumeProgressBarProps {
	volume: SharedValue<number>;
	height?: number;
	color?: string;
	backgroundColor?: string;
	width?: number;
}

export function VolumeProgressBar({
	volume,
	height = 4,
	color = "#FF00FF",
	backgroundColor = "rgba(255, 255, 255, 0.2)",
	width = 100,
}: VolumeProgressBarProps) {
	// Calculate progress as a percentage based on volume (0-1)
	const progress = useDerivedValue(() => {
		"worklet";
		// Ensure volume is treated as a value between 0 and 1
		return Math.min(Math.max(volume.value, 0), 1) * width;
	}, [volume, width]);

	return (
		<Canvas style={{ height, width }}>
			{/* Background bar */}
			<RoundedRect
				x={0}
				y={0}
				width={width}
				height={height}
				r={height / 2}
				color={backgroundColor}
			/>
			{/* Progress bar */}
			<RoundedRect
				x={0}
				y={0}
				width={progress}
				height={height}
				r={height / 2}
				color={color}
			/>
		</Canvas>
	);
}
