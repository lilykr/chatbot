import { Canvas, RoundedRect } from "@shopify/react-native-skia";
import { StyleSheet } from "react-native";
import { type SharedValue, useDerivedValue } from "react-native-reanimated";

interface VolumeProgressBarProps {
	volume: SharedValue<number>;
	height?: number;
	color?: string;
	backgroundColor?: string;
}

export function VolumeProgressBar({
	volume,
	height = 4,
	color = "#FF00FF",
	backgroundColor = "rgba(255, 255, 255, 0.2)",
}: VolumeProgressBarProps) {
	const progress = useDerivedValue(() => {
		"worklet";
		return volume.value * 100;
	}, [volume]);

	return (
		<Canvas style={[styles.canvas, { height }]}>
			{/* Background bar */}
			<RoundedRect
				x={0}
				y={0}
				width={100}
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

const styles = StyleSheet.create({
	canvas: {
		width: 100,
	},
});
