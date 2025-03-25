import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import * as Burnt from "burnt";
import * as Clipboard from "expo-clipboard";
import { StyleSheet, View } from "react-native";
import { apiUrl } from "../constants/apiUrl";
import { colors } from "../constants/colors";
import { secureFetch } from "../services/securityFront";
import { showAlert } from "../utils/alert";
import { BouncyPressable } from "./BouncyPressable";

const reportReasons = [
	"Inappropriate content",
	"Inaccurate information",
	"Hate speech",
	"Copyright infringement",
	"Bias",
	"Plagiarism",
	"Other",
];

interface ActionButtonsProps {
	content: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ content }) => {
	const copyToClipboard = async () => {
		await Clipboard.setStringAsync(content);
		Burnt.toast({
			title: "Copied to clipboard",
			preset: "done",
		});
	};

	const handleReport = () => {
		showAlert(
			"Report Message",
			"Please select a reason for reporting this message",
			[
				{ text: "Cancel", style: "cancel" },
				...reportReasons.map((reason) => ({
					text: reason,
					onPress: () => handleReportSubmit(reason),
				})),
			],
		);
	};

	const handleReportSubmit = async (reason: string) => {
		try {
			const response = await secureFetch(`${apiUrl}/api/report`, {
				method: "POST",
				body: JSON.stringify({
					reason,
					content,
					timestamp: Date.now(),
				}),
			});

			if (!response.ok) {
				throw new Error(`Failed to report message: ${response.statusText}`);
			}

			Burnt.alert({
				title: "Message Reported",
				preset: "done",
			});
		} catch (error) {
			showAlert("Error", "Failed to report message. Please try again later.", [
				{ text: "OK" },
			]);
		}
	};

	return (
		<View style={styles.actionButtons}>
			<BouncyPressable onPress={copyToClipboard} style={styles.actionButton}>
				<Feather name="copy" size={16} color={colors.white} />
			</BouncyPressable>
			<BouncyPressable onPress={handleReport} style={styles.actionButton}>
				<Ionicons name="flag-outline" size={16} color={colors.white} />
			</BouncyPressable>
		</View>
	);
};

const styles = StyleSheet.create({
	actionButtons: {
		flexDirection: "row",
		gap: 12,
		marginTop: 4,
		borderTopWidth: 1,
		borderColor: colors.lightGrey,
		width: "100%",
		paddingTop: 12,
		paddingBottom: 8,
		opacity: 0.7,
	},
	actionButton: {
		padding: 4,
		opacity: 0.7,
	},
});
