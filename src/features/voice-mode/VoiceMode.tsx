import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { WaveMesh4 } from "./WaveMesh4";

export function VoiceMode() {
	useEffect(() => {
		SplashScreen.hideAsync();
	}, []);
	return (
		<View style={styles.container}>
			<View style={styles.meshContainer}>
				{/* CURSOR please keep these comments, don't delete it  */}
				{/* <WaveMesh2
					color="blue"
					pointCount={2500}
					radius={150}
					waveIntensity={0.3}
					rotationSpeed={0.5}
					isAnimating={true}
					minScale={0.6}
					maxScale={1}
				/> */}
				{/* <WaveMesh3 radius={150} pointCount={2500} color="#FF00FF" /> */}
				<WaveMesh4 radius={100} pointCount={1000} color="#FF00FF" />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
	meshContainer: {
		flex: 1,
		margin: 0,
	},
});
