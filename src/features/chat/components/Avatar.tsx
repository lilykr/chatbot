import type React from "react";
import {
	Image,
	StyleSheet,
	View,
	type ImageSourcePropType,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../constants/colors";

interface AvatarProps {
	source: string | ImageSourcePropType | undefined;
	position: "left" | "right";
}

export const Avatar: React.FC<AvatarProps> = ({ source, position }) => {
	return (
		<View
			style={[
				styles.container,
				position === "left" ? styles.leftContainer : styles.rightContainer,
			]}
		>
			{source ? (
				<Image
					source={typeof source === "string" ? { uri: source } : source}
					style={styles.image}
				/>
			) : (
				<View style={styles.fallbackContainer}>
					<Feather name="user" size={16} color="white" />
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: 27,
		height: 27,
		borderRadius: 13.5,
		overflow: "hidden",
	},
	leftContainer: {
		borderWidth: 1,
		borderColor: colors.lightGrey,
	},
	rightContainer: {},
	image: {
		width: "100%",
		height: "100%",
	},
	fallbackContainer: {
		backgroundColor: colors.lightGrey,
		width: "100%",
		height: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
});
