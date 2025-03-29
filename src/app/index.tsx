import React, { useEffect } from "react";
import Homepage from "../features/homepage";
import * as Updates from "expo-updates";
import { Alert } from "react-native";
import { useI18n } from "../i18n/i18n";

export default function Home() {
	const { t } = useI18n();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const checkForUpdates = async () => {
			try {
				const update = await Updates.checkForUpdateAsync();
				if (update.isAvailable) {
					await Updates.fetchUpdateAsync();
					Alert.alert(
						t("app.update_available"),
						t("app.update_available_download"),
						[
							{ text: t("app.later") },
							{
								text: t("app.restart_now"),
								onPress: () => Updates.reloadAsync(),
							},
						],
					);
				}
			} catch (e) {
				console.error("Error checking for updates:", e);
			}
		};

		// Initial check
		if (process.env.NODE_ENV !== "development") {
			checkForUpdates();
		}
	}, []);

	return <Homepage />;
}
