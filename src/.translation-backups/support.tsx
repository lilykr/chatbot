import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
} from "react-native";

const SupportPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = () => {
		setSubmitted(true);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Support</Text>
			<Text style={styles.description}>
				Need help? Fill out the form below and we'll get back to you as soon as
				possible.
			</Text>

			{submitted ? (
				<Text style={styles.successMessage}>
					Thank you! Your message has been received.
				</Text>
			) : (
				<View>
					<TextInput
						style={styles.input}
						placeholder="Your Name"
						value={name}
						onChangeText={setName}
					/>
					<TextInput
						style={styles.input}
						placeholder="Your Email"
						keyboardType="email-address"
						value={email}
						onChangeText={setEmail}
					/>
					<TextInput
						style={[styles.input, styles.textArea]}
						placeholder="Your Message"
						multiline
						numberOfLines={4}
						value={message}
						onChangeText={setMessage}
					/>
					<TouchableOpacity style={styles.button} onPress={handleSubmit}>
						<Text style={styles.buttonText}>Submit</Text>
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
