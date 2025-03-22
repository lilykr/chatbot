import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";
import { Pill } from "./Pill";
import { Text } from "./Text";

const RANT_SUGGESTIONS = [
	"Technology",
	"Social Media",
	"Modern Dating",
	"AI",
	"Traffic",
	"Meetings",
];

interface RantSuggestionsProps {
	onSelectTopic: (topic: string) => void;
}

export const RantSuggestions = ({ onSelectTopic }: RantSuggestionsProps) => {
	return (
		<View style={styles.container}>
			<Text style={styles.suggestionsText}>Suggestions:</Text>
			<View style={styles.pillsContainer}>
				{RANT_SUGGESTIONS.map((topic) => (
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
