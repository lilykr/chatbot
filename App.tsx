import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Chat } from "./src/components/Chat";

export function App() {
	return (
		<SafeAreaProvider>
			<StatusBar style="dark" />
			<Chat />
		</SafeAreaProvider>
	);
}
