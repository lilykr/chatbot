import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";
import { Pill } from "./Pill";
import { Text } from "./Text";

const RANT_SUGGESTIONS = [
	"Social Media",
	"Modern Dating",
	"AI",
	"Traffic",
	"Customer Service",
	"Public Transport",
	"Smartphone Addiction",
	"Work Meetings",
	"Email Etiquette",
	"Fast Food",
	"Weather",
	"Airport Security",
	"Self-Checkout",
	"Streaming Services",
	"Internet Speed",
	"Phone Battery Life",
	"Parking",
	"Gym Culture",
	"Coffee Prices",
	"Remote Work",
	"Online Ads",
	"Delivery Apps",
	"Social Plans",
	"Tech Support",
	"Gaming",
	"Reality TV",
	"Fashion Trends",
	"Home Renovation",
	"Food Delivery",
	"Influencers",
];

interface RantSuggestionsProps {
	onSelectTopic: (topic: string) => void;
}

export const RantSuggestions = ({ onSelectTopic }: RantSuggestionsProps) => {
	const randomTopics = useMemo(() => {
		const shuffled = [...RANT_SUGGESTIONS].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 3);
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.suggestionsText}>Suggestions:</Text>
			<View style={styles.pillsContainer}>
				{randomTopics.map((topic) => (
					<Pill
						key={topic}
						label={topic}
						onPress={() => onSelectTopic(topic)}
					/>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginTop: 16,
		alignItems: "center",
		marginBottom: 16,
	},
	suggestionsText: {
		color: colors.lightGrey,
		fontSize: 14,
		marginBottom: 8,
	},
	pillsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 8,
		paddingHorizontal: 16,
	},
});
