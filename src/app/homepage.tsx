import { Link } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardButton } from "../components/CardButton";
import { SearchBar } from "../components/SearchBar";
import { Text } from "../components/Text";
import { colors } from "../constants/colors";
import { MeshGradient } from "../features/MeshGradient/MeshGradient";

export default function Homepage() {
	return (
		<>
			<MeshGradient />
			<SafeAreaView style={styles.layout}>
				<Text
					weight="medium"
					style={{
						color: "white",
						fontSize: 28,
						width: "70%",
						paddingTop: 80,
					}}
				>
					Create, explore, be inspired
				</Text>
				<SearchBar />
				<View style={styles.buttonContainer}>
					<Link href="/chat">
						<CardButton
							text="AI text writer"
							backgroundColor={colors.night}
							borderColor={colors.lightGrey}
						/>
					</Link>
					<Link href="/voiceMode">
						<CardButton
							text="AI Voice mode"
							backgroundColor={colors.night}
							borderColor={colors.lightGrey}
						/>
					</Link>
				</View>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	layout: {
		flex: 1,
		marginHorizontal: 16,
		zIndex: 1,
	},
	buttonContainer: {
		flexDirection: "row",
		gap: 16,
		marginTop: 24,
	},
});
