import { StyleSheet, View } from "react-native";
import { WaveMesh } from "./components/WaveMesh";

export const VoiceMode = () => {
	return (
		<View style={styles.layout}>
			<WaveMesh />
		</View>
	);
};

const styles = StyleSheet.create({
	layout: {
		flex: 1,
		backgroundColor: "black",
	},
});
