import type React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

const PrivacyPolicy = () => {
	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>Privacy Policy</Text>
			<Text style={styles.date}>Last updated: 23/03/25</Text>

			<Section title="Welcome to Lisa-Lou!">
				<Text>
					Your privacy is important to us. This Privacy Policy explains how we
					collect, use, and protect your data when you use our app.
				</Text>
			</Section>

			<Section title="1. Information We Collect">
				<Text>
					- No Personal Data Required: You can use the app without creating an
					account or providing personal details.
				</Text>

				<Text>
					- Interaction Data: We may collect non-personal usage data (e.g.,
					which mini-apps are most popular) to improve the experience.
				</Text>

				<Text>
					- AI Conversations: The chat interactions are processed in real-time
					but are not stored or used to track you.
				</Text>
			</Section>

			<Section title="2. How We Use Your Data">
				<Text>- Improve app performance and user experience.</Text>
				<Text>- Enhance AI responses and features.</Text>
				<Text>- Fix bugs and optimize interactions.</Text>

				<Text>
					We do not sell, rent, or share your data with third parties for
					advertising purposes.
				</Text>
			</Section>

			<Section title="3. Third-Party Services">
				<Text>
					To ensure smooth performance, we may use third-party services (such as
					analytics tools) that comply with privacy laws. These services may
					collect anonymized data for app improvement but do not track your
					identity.
				</Text>
			</Section>

			<Section title="4. Data Security">
				<Text>
					We take appropriate security measures to protect your data from
					unauthorized access or misuse. However, no system is 100% secure, so
					we encourage users to avoid sharing sensitive information in AI
					interactions.
				</Text>
			</Section>

			<Section title="5. Your Rights">
				<Text>
					- Access & Deletion: You can request to see or delete any collected
					data.
				</Text>

				<Text>
					- Opt-Out: You can disable analytics tracking in the settings (if
					applicable).
				</Text>
			</Section>

			<Section title="6. Changes to This Policy">
				<Text>
					We may update this Privacy Policy as the app evolves. Any changes will
					be reflected here, and we’ll notify users if necessary.
				</Text>
			</Section>

			<Section title="7. Contact Us">
				<Text>
					If you have any questions about this Privacy Policy, feel free to
					reach out at{" "}
					<Text
						style={styles.link}
						onPress={() => Linking.openURL("mailto:lisa.lou.kara@gmail.com")}
					>
						lisa.lou.kara@gmail.com
					</Text>
					.
				</Text>
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
