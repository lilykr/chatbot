import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React from "react";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "./constants/colors";
import { Chat } from "./features/chat/Chat";
import ErrorBoundary from "react-native-error-boundary";

SplashScreen.preventAutoHideAsync();

export function App() {
	return (
		<ErrorBoundary>
			<StatusBar style="light" backgroundColor={colors.night} />
			<SafeAreaProvider>
				<Chat />
			</SafeAreaProvider>
		</ErrorBoundary>
	);
}
