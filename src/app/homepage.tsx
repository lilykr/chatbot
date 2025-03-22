import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CardButton } from "../components/CardButton";
import { History } from "../components/History";
import { RoundButton } from "../components/RoundButton";
import { SearchBar } from "../components/SearchBar";
import { Text } from "../components/Text";
import { colors } from "../constants/colors";
import { MeshGradient } from "../features/MeshGradient/MeshGradient";

export default function Homepage() {
	const insets = useSafeAreaInsets();
	return (
		<>
			<MeshGradient />
			<View style={[styles.layout]}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					style={styles.mainScrollView}
					contentContainerStyle={{
						paddingTop: insets.top,
						paddingBottom: insets.bottom,
					}}
				>
					<View
						style={{
							width: "100%",
							flexDirection: "row",
							justifyContent: "flex-start",
							marginTop: 16,
							marginBottom: 36,
							paddingHorizontal: 16,
						}}
					>
						<RoundButton
							size={56}
							onPress={() => router.push("/animated-card")}
						>
							<Ionicons name="sparkles" size={24} color="white" />
						</RoundButton>
					</View>
					<Text
						weight="semibold"
						style={{
							color: "white",
							fontSize: 28,
							width: "70%",
							marginBottom: 8,
							paddingHorizontal: 16,
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
								onPress={() => router.push("/chat/new?openVoiceMode=true")}
							/>
							<CardButton
								text="AI Rant"
								borderColor={colors.lightGrey}
								onPress={() => router.push("/aiRant/new")}
							/>
						</View>
					</ScrollView>
					<History />
				</ScrollView>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	layout: {
		zIndex: 1,
		flex: 1,
	},
	mainScrollView: {
		flex: 1,
		height: "100%",
	},
	scrollContent: {
		paddingRight: 16,
	},
	scrollView: {
		paddingHorizontal: 16,
		minHeight: 200,
	},
	buttonContainer: {
		flexDirection: "row",
		gap: 16,
		marginTop: 8,
	},
});
