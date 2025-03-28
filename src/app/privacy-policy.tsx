import type React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import FormattedText from "../i18n/FormattedText";
import { useI18n } from "../i18n/i18n";

const PrivacyPolicy = () => {
	const { t } = useI18n();
	return (
		<ScrollView style={styles.container}>
			<FormattedText style={styles.title} id="app.privacy_policy" />
			<FormattedText style={styles.date} id="app.last_updated_230325" />

			<Section title={t("app.welcome_to_lisalou")}>
				<FormattedText id="app.your_privacy_is_important_to_u" />
			</Section>

			<Section title={t("app.1_information_we_collect")}>
				<FormattedText id="app.no_personal_data_required_you_" />

				<FormattedText id="app.interaction_data_we_may_collec" />

				<FormattedText id="app.ai_conversations_the_chat_inte" />
			</Section>

			<Section title={t("app.2_how_we_use_your_data")}>
				<FormattedText id="app.improve_app_performance_and_us" />
				<FormattedText id="app.enhance_ai_responses_and_featu" />
				<FormattedText id="app.fix_bugs_and_optimize_interact" />

				<FormattedText id="app.we_do_not_sell_rent_or_share_y" />
			</Section>

			<Section title={t("app.3_thirdparty_services")}>
				<FormattedText id="app.to_ensure_smooth_performance_w" />
			</Section>

			<Section title={t("app.4_data_security")}>
				<FormattedText id="app.we_take_appropriate_security_m" />
			</Section>

			<Section title={t("app.5_your_rights")}>
				<FormattedText id="app.access_deletion_you_can_reques" />

				<FormattedText id="app.optout_you_can_disable_analyti" />
			</Section>

			<Section title={t("app.6_changes_to_this_policy")}>
				<FormattedText id="app.we_may_update_this_privacy_pol" />
			</Section>

			<Section title={t("app.7_contact_us")}>
				<FormattedText id="app.if_you_have_any_questions_abou" />
			</Section>
		</ScrollView>
	);
};

const Section = ({
	title,
	children,
}: { title: string; children: React.ReactNode }) => (
	<View style={styles.section}>
		<Text style={styles.sectionTitle}>{title}</Text>
		{children}
	</View>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f9f9f9",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
		color: "#222",
	},
	date: {
		textAlign: "center",
		marginBottom: 20,
		color: "#666",
	},
	section: {
		marginBottom: 20,
		padding: 15,
		backgroundColor: "#fff",
		borderRadius: 8,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 5,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 5,
		color: "#333",
	},
	link: {
		color: "blue",
		textDecorationLine: "underline",
	},
});

export default PrivacyPolicy;
