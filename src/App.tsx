import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "./constants/colors";
import { Chat } from "./features/chat/Chat";

export function App() {
	return (
		<>
			<StatusBar style="light" backgroundColor={colors.night} />
			<SafeAreaProvider>
				<Chat />
			</SafeAreaProvider>
		</>
	);
}
