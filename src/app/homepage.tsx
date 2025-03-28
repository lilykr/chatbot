import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CardButton } from "../components/CardButton";
import { History } from "../components/History";
import { RoundButton } from "../components/RoundButton";
import { SearchBar } from "../components/SearchBar";
import { colors } from "../constants/colors";
import { MeshGradient } from "../features/MeshGradient/MeshGradient";
import FormattedText from "../i18n/FormattedText";
import { useI18n } from "../i18n/i18n";

export default function Homepage() {
	const { t } = useI18n();
	const insets = useSafeAreaInsets();
	const [searchQuery, setSearchQuery] = useState("");
	// Define the card data
	const cards = [
		{
			text: t("app.the_sassy_chatbot"),
			onPress: () => router.push("/chat/new"),
		},
		{
			text: t("app.ai_rant"),
			onPress: () => router.push("/aiRant/new"),
		},
		{
			text: t("app.ai_voice_mode"),
			onPress: () => router.push("/chat/new?openVoiceMode=true"),
		},
		{
			text: t("app.lisa_lou_chatbot"),
			onPress: () => router.push("/chatWithLily/new"),
		},
	];

	// Filter cards based on search query
	const filteredCards = searchQuery
		? cards.filter((card) =>
				card.text.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: cards;

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
					<FormattedText
						weight="semibold"
						style={{
							color: "white",
							fontSize: 28,
							lineHeight: 34,
							width: "70%",
							marginBottom: 8,
							paddingHorizontal: 16,
						}}
						id="app.create_explore_be_inspired"
					/>

					<SearchBar onSearch={setSearchQuery} placeholder={t("app.search")} />
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.scrollContent}
						style={styles.scrollView}
					>
						<View style={styles.buttonContainer}>
							{filteredCards.map((card) => (
								<CardButton
									key={card.text}
									text={card.text}
									borderColor={colors.lightGrey}
									onPress={card.onPress}
								/>
							))}
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
