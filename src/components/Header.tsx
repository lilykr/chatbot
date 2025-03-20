import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, View, Pressable, Image } from "react-native";
import { Text } from "./Text";
import { colors } from "../constants/colors";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const LOGO = require("../../assets/avatar.png");

interface HeaderProps {
	title: string;
	showBackButton?: boolean;
}

export const Header = ({ title, showBackButton = true }: HeaderProps) => {
	const safeAreaInsets = useSafeAreaInsets();
	const handleBack = () => {
		router.back();
	};

	return (
		<BlurView
			intensity={80}
			tint="dark"
			style={[
				styles.container,
				{
					paddingTop: safeAreaInsets.top,
				},
			]}
		>
			{showBackButton && (
				<Pressable onPress={handleBack} style={styles.backButton}>
					<Ionicons name="chevron-back" size={24} color="white" />
				</Pressable>
			)}
			<View style={styles.logoBorder}>
				<Image source={LOGO} style={styles.logo} />
			</View>
			<Text style={styles.title} weight="medium">
				{title}
			</Text>
		</BlurView>
	);
};

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 8,
		zIndex: 100,
	},
	backButton: {
		marginRight: 12,
		padding: 4,
	},
	logoBorder: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginRight: 8,
		padding: 2,
		borderWidth: 1,
		borderColor: colors.lightGrey,
		justifyContent: "center",
		alignItems: "center",
	},
	logo: {
		width: 28,
		height: 28,
		borderRadius: 14,
	},
	title: {
		fontSize: 18,
		color: "white",
	},
});
