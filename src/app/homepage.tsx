import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardButton } from "../components/CardButton";
import { History } from "../components/History";
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
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
					style={styles.scrollView}
				>
					<View style={styles.buttonContainer}>
						<CardButton
							text="AI text writer"
							borderColor={colors.lightGrey}
							onPress={() => router.push("/chat/new")}
						/>
						<CardButton
							text="Lisa-Lou's chatbot"
							borderColor={colors.lightGrey}
							onPress={() => router.push("/chatWithLily/new")}
						/>
						<CardButton
							text="AI Voice mode"
							borderColor={colors.lightGrey}
							onPress={() => router.push("/voiceMode")}
						/>
						<CardButton
							text="AI Rant"
							borderColor={colors.lightGrey}
							onPress={() => router.push("/aiRant")}
						/>
					</View>
				</ScrollView>
				<History />
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	layout: {
		marginHorizontal: 16,
		zIndex: 1,
	},
	scrollContent: {
		paddingRight: 16,
	},
	scrollView: {
		marginHorizontal: -16, // Negates the parent's horizontal margin
		paddingHorizontal: 16,
		minHeight: 200,
	},
	buttonContainer: {
		flexDirection: "row",
		gap: 16,
		marginTop: 24,
	},
});
