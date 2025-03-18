import {
	Epilogue_400Regular,
	Epilogue_500Medium,
	Epilogue_800ExtraBold,
	useFonts,
} from "@expo-google-fonts/epilogue";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import ErrorBoundary from "react-native-error-boundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../constants/colors";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		Epilogue_400Regular,
		Epilogue_500Medium,
		Epilogue_800ExtraBold,
	});

	useEffect(() => {
		// Hide the splash screen when the component mounts
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<ErrorBoundary>
			<StatusBar style="light" backgroundColor={colors.night} />
			<GestureHandlerRootView>
				<SafeAreaProvider>
					<Stack
						screenOptions={{
							headerShown: false,
							contentStyle: { backgroundColor: colors.night },
						}}
					/>
				</SafeAreaProvider>
			</GestureHandlerRootView>
		</ErrorBoundary>
	);
}
