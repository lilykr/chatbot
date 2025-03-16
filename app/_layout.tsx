import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import ErrorBoundary from "react-native-error-boundary";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../src/constants/colors";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	useEffect(() => {
		// Hide the splash screen when the component mounts
		SplashScreen.hideAsync();
	}, []);

	return (
		<ErrorBoundary>
			<StatusBar style="light" backgroundColor={colors.night} />
			<SafeAreaProvider>
				<Stack
					screenOptions={{
						headerShown: false,
						contentStyle: { backgroundColor: colors.night },
					}}
				/>
			</SafeAreaProvider>
		</ErrorBoundary>
	);
}
