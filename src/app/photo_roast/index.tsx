import { View } from "react-native";
import { Text } from "../../components/Text";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { ResponseDisplay } from "../../components/ResponseDisplay";
import { Header } from "../../components/Header";
import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../../i18n/i18n";
import { PhotoUploadInput } from "../../components/PhotoUploadInput";

export default function PhotoRoast() {
	const { t } = useI18n();
	const safeAreaInsets = useSafeAreaInsets();
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [roastContent, setRoastContent] = useState<string | null>(null);

	const pickImage = useCallback(async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled && result.assets[0]) {
			setSelectedImage(result.assets[0].uri);
			// Here you would typically upload the image and get the roast
			setIsLoading(true);
			// Add your API call here
			setIsLoading(false);
		}
	}, []);

	const handleNewRoast = useCallback(() => {
		setSelectedImage(null);
		setRoastContent(null);
	}, []);

	return (
		<View
			style={[
				styles.container,
				{
					paddingTop: safeAreaInsets.top,
					paddingBottom: safeAreaInsets.bottom,
				},
			]}
		>
			<Header title={t("app.photo_roast")} type="roast" />

			<View style={styles.content}>
				{selectedImage ? (
					<ResponseDisplay
						content={roastContent ?? ""}
						isLoading={isLoading}
						onNewResponse={handleNewRoast}
						newResponseButtonText={t("app.new_roast")}
					/>
				) : (
					<PhotoUploadInput
						onSubmit={pickImage}
						prompt={t("app.what_would_you_like_me_to_roast")}
						submitButtonText={t("app.select_photo")}
					/>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.night,
	},
	content: {
		flex: 1,
		alignItems: "center",
	},
});
