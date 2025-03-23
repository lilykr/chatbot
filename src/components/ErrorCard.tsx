import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { StyleSheet, View } from "react-native";
import { colors } from "../constants/colors";
import { Text } from "./Text";

type Props = {
	error: Error;
};
export const ErrorCard = ({ error }: Props) => {
	return (
		<View style={styles.errorContainer}>
			<MaterialCommunityIcons
				name="emoticon-dead"
				size={24}
				color={colors.error}
			/>
			<Text style={styles.errorText}>{error.message}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	errorContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.errorBackground || "rgba(255, 0, 0, 0.1)",
		padding: 12,
		marginHorizontal: 16,
		marginBottom: 8,
		borderRadius: 8,
	},
	errorText: {
		color: colors.error || "white",
		marginLeft: 8,
		flex: 1,
	},
});
