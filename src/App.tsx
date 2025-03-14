import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React from "react";

import ErrorBoundary from "react-native-error-boundary";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "./constants/colors";
import { VoiceMode } from "./features/voice-mode/VoiceMode";
SplashScreen.preventAutoHideAsync();

export function App() {
	return (
		<ErrorBoundary>
			<StatusBar style="light" backgroundColor={colors.night} />
			<SafeAreaProvider>
				{/* <Chat /> */}
				<VoiceMode />
			</SafeAreaProvider>
		</ErrorBoundary>
	);
}
