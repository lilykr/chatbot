import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { VolumeProgressBar } from "./VolumeProgressBar";

interface DebugVolumeProps {
	volume: SharedValue<number>;
	isManualMode: boolean;
	onManualModeToggle: (value: boolean) => void;
	onVolumeChange: (value: number) => void;
}

export const DebugVolume = ({
	volume,
	isManualMode,
	onManualModeToggle,
	onVolumeChange,
}: DebugVolumeProps) => {
	return (
		<View style={styles.controls}>
			<View style={styles.switchContainer}>
				<Text style={styles.switchLabel}>Manual Mode</Text>
				<Switch
					value={isManualMode}
					onValueChange={onManualModeToggle}
					trackColor={{ false: "#666", true: "#FF00FF" }}
				/>
			</View>
			{isManualMode && (
				<View style={styles.buttonContainer}>
					{Array.from({ length: 10 }, (_, i) => {
						const buttonValue = i + 1;
						return (
							<Pressable
								key={`volume-${buttonValue}`}
								style={styles.button}
								onPress={() => onVolumeChange(buttonValue)}
							>
								<Text style={styles.buttonText}>{buttonValue}</Text>
							</Pressable>
						);
					})}
				</View>
			)}
			<VolumeProgressBar volume={volume} />
		</View>
	);
};

const styles = StyleSheet.create({
	controls: {
		alignItems: "center",
		gap: 10,
	},
	switchContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	switchLabel: {
		color: "white",
		fontSize: 16,
	},
	buttonContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 8,
		paddingHorizontal: 20,
	},
	button: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: "rgba(255, 0, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 14,
	},
});
