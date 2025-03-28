import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import FormattedText from "../i18n/FormattedText";
import { useI18n } from "../i18n/i18n";

const SupportPage = () => {
	const { t } = useI18n();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = () => {
		setSubmitted(true);
	};

	return (
		<View style={styles.container}>
			<FormattedText style={styles.title} id="app.support" />
			<FormattedText
				style={styles.description}
				id="app.need_help_fill_out_the_form_be"
			/>

			{submitted ? (
				<FormattedText
					style={styles.successMessage}
					id="app.thank_you_your_message_has_bee"
				/>
			) : (
				<View>
					<TextInput
						style={styles.input}
						placeholder={t("app.your_name")}
						value={name}
						onChangeText={setName}
					/>

					<TextInput
						style={styles.input}
						placeholder={t("app.your_email")}
						keyboardType="email-address"
						value={email}
						onChangeText={setEmail}
					/>

					<TextInput
						style={[styles.input, styles.textArea]}
						placeholder={t("app.your_message")}
						multiline
						numberOfLines={4}
						value={message}
						onChangeText={setMessage}
					/>

					<TouchableOpacity style={styles.button} onPress={handleSubmit}>
						<FormattedText style={styles.buttonText} id="app.submit" />
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
};

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
	description: {
		textAlign: "center",
		marginBottom: 20,
		color: "#666",
	},
	input: {
		backgroundColor: "#fff",
		padding: 15,
		borderRadius: 8,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: "#ccc",
	},
	textArea: {
		height: 100,
	},
	button: {
		backgroundColor: "#007bff",
		padding: 15,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
	},
	successMessage: {
		textAlign: "center",
		color: "green",
		fontSize: 16,
	},
});

export default SupportPage;
