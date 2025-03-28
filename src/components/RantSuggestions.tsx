import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";
import FormattedText from "../i18n/FormattedText";
import { useI18n } from "../i18n/i18n";
import { Pill } from "./Pill";

// Translation IDs for rant topics
const RANT_SUGGESTION_IDS = [
	"rant.topic.social_media",
	"rant.topic.modern_dating",
	"rant.topic.ai",
	"rant.topic.traffic",
	"rant.topic.customer_service",
	"rant.topic.public_transport",
	"rant.topic.smartphone_addiction",
	"rant.topic.work_meetings",
	"rant.topic.email_etiquette",
	"rant.topic.fast_food",
	"rant.topic.weather",
	"rant.topic.airport_security",
	"rant.topic.self_checkout",
	"rant.topic.streaming_services",
	"rant.topic.internet_speed",
	"rant.topic.phone_battery",
	"rant.topic.parking",
	"rant.topic.gym_culture",
	"rant.topic.coffee_prices",
	"rant.topic.remote_work",
	"rant.topic.online_ads",
	"rant.topic.delivery_apps",
	"rant.topic.social_plans",
	"rant.topic.tech_support",
	"rant.topic.gaming",
	"rant.topic.reality_tv",
	"rant.topic.fashion_trends",
	"rant.topic.home_renovation",
	"rant.topic.food_delivery",
	"rant.topic.influencers",
] as const;

interface RantSuggestionsProps {
	onSelectTopic: (topic: string) => void;
}

export const RantSuggestions = ({ onSelectTopic }: RantSuggestionsProps) => {
	const { t } = useI18n();

	const randomTopicIds = useMemo(() => {
		const shuffled = [...RANT_SUGGESTION_IDS].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 3);
	}, []);

	return (
		<View style={styles.container}>
			<FormattedText style={styles.suggestionsText} id="app.suggestions" />
			<View style={styles.pillsContainer}>
				{randomTopicIds.map((topicId) => (
					<Pill
						key={topicId}
						label={t(topicId)}
						onPress={() => onSelectTopic(t(topicId))}
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
