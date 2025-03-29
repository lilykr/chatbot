import "@stardazed/streams-polyfill";
import "../utils/polyfill.ts";

import {
	Epilogue_400Regular,
	Epilogue_500Medium,
	Epilogue_600SemiBold,
	Epilogue_700Bold,
	useFonts,
} from "@expo-google-fonts/epilogue";
import { Stack } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	ReanimatedLogLevel,
	configureReanimatedLogger,
} from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { I18nProvider } from "../i18n/i18n";

if (Platform.OS !== "web" && !process.env.CI) {
	ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}

SystemUI.setBackgroundColorAsync(colors.night);
configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});
SplashScreen.preventAutoHideAsync();

function RootLayout() {
	const [fontsLoaded] = useFonts({
		Epilogue_400Regular,
		Epilogue_500Medium,
		Epilogue_600SemiBold,
		Epilogue_700Bold,
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
			<StatusBar style="light" translucent />
			<GestureHandlerRootView>
				<SafeAreaProvider>
					<I18nProvider>
						<Stack
							screenOptions={{
								headerShown: false,
								contentStyle: { backgroundColor: colors.night },
								gestureEnabled: true,
								animation:
									Platform.OS === "android" ? "slide_from_right" : undefined,
							}}
						>
							<Stack.Screen
								name="index"
								options={{
									animation: "fade",
									animationDuration: 300,
								}}
							/>
							<Stack.Screen
								name="animated-card"
								options={{
									animation: "fade",
									animationDuration: 300,
								}}
							/>
						</Stack>
					</I18nProvider>
				</SafeAreaProvider>
			</GestureHandlerRootView>
		</ErrorBoundary>
	);
}

export default RootLayout;
