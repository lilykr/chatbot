import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";
import FormattedText from "../i18n/FormattedText";
import { BouncyPressable } from "./BouncyPressable";
import { Text } from "./Text";

const RANT_SUGGESTIONS = [
	"Technology",
	"Social Media",
	"Modern Dating",
	"AI",
	"Traffic",
	"Meetings",
];

interface RantPillsProps {
	onSelectTopic: (topic: string) => void;
}

export const RantPills = ({ onSelectTopic }: RantPillsProps) => {
	return (
		<View style={styles.container}>
			<FormattedText style={styles.suggestionsText} id="app.suggestions" />
			<View style={styles.pillsContainer}>
				{RANT_SUGGESTIONS.map((topic) => (
					<BouncyPressable
						key={topic}
						style={styles.pill}
						onPress={() => onSelectTopic(topic)}
					>
						<Text style={styles.pillText}>{topic}</Text>
					</BouncyPressable>
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
	pill: {
		backgroundColor: colors.darkGrey,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
	},
	pillText: {
		color: colors.white,
		fontSize: 14,
	},
});
