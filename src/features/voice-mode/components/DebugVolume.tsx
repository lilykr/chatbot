import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import {
	type SharedValue,
	runOnJS,
	useAnimatedReaction,
} from "react-native-reanimated";
import { VolumeProgressBar } from "./VolumeProgressBar";

interface DebugVolumeProps {
	volume: SharedValue<number>;
	isManualMode: boolean;
	onManualModeToggle: (enabled: boolean) => void;
	onVolumeChange: (level: number) => void;
}

export const DebugVolume = ({
	volume,
	isManualMode,
	onManualModeToggle,
	onVolumeChange,
}: DebugVolumeProps) => {
	// Track volume changes for debugging without accessing .value during render
	const [displayVolume, setDisplayVolume] = useState(0);

	// Use animated reaction to track volume changes
	useAnimatedReaction(
		() => volume.value,
		(currentValue) => {
			runOnJS(setDisplayVolume)(currentValue);
		},
		[volume],
	);

	// Handle manual mode toggle
	const handleManualModeToggle = useCallback(
		(value: boolean) => {
			onManualModeToggle(value);
		},
		[onManualModeToggle],
	);

	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<Text style={styles.label}>Manual Mode</Text>
				<Switch
					value={isManualMode}
					onValueChange={handleManualModeToggle}
					trackColor={{ false: "#767577", true: "#81b0ff" }}
					thumbColor={isManualMode ? "#f5dd4b" : "#f4f3f4"}
				/>
			</View>
			<Text style={styles.volumeText}>
				Volume: {Math.round(displayVolume * 100)}%
			</Text>
			{isManualMode && (
				<View style={styles.buttonContainer}>
					{Array.from({ length: 10 }, (_, i) => {
						const buttonValue = i + 1;
						return (
							<Pressable
								key={`volume-${buttonValue}`}
								style={[
									styles.button,
									{
										backgroundColor:
											Math.round(displayVolume * 10) === buttonValue
												? "rgba(255, 0, 255, 0.8)"
												: "rgba(255, 0, 255, 0.2)",
									},
								]}
								onPress={() => onVolumeChange(buttonValue)}
							>
								<Text style={styles.buttonText}>{buttonValue}</Text>
							</Pressable>
						);
					})}
				</View>
			)}
			<VolumeProgressBar volume={volume} width={200} height={8} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		padding: 15,
		borderRadius: 10,
		width: "80%",
		alignItems: "center",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		marginBottom: 10,
	},
	label: {
		color: "white",
		fontSize: 16,
	},
	volumeText: {
		color: "white",
		fontSize: 16,
		marginBottom: 10,
	},
	buttonContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 8,
		marginBottom: 10,
	},
	button: {
		width: 30,
		height: 30,
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 14,
	},
});
