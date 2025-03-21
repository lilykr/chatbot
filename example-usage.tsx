import React, { useState } from "react";
import { Button, Easing, StyleSheet, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "./src/components/KeyboardAvoidingView";

export default function App() {
	const [text, setText] = useState("");

	return (
		<View style={styles.container}>
			<KeyboardAvoidingView
				offset={10} // always applied offset
				keyboardOpenedOffset={20} // additional offset only when keyboard is open
				duration={300} // slightly longer animation (300ms)
				easing={Easing.bezier(0.16, 1, 0.3, 1)} // Custom bezier curve for a nice feel
			>
				<View style={styles.content}>
					<View style={styles.spacer} />
					<TextInput
						style={styles.input}
						value={text}
						onChangeText={setText}
						placeholder="Type something..."
					/>
					<Button title="Submit" onPress={() => console.log(text)} />
				</View>
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: "flex-end", // Position content at the bottom
		padding: 20,
	},
	spacer: {
		flex: 1, // This pushes the input to the bottom
	},
	input: {
		height: 50,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		marginBottom: 20,
		paddingHorizontal: 10,
	},
});
