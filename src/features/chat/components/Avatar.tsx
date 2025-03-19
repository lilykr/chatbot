import type React from "react";
import { Image, StyleSheet, View } from "react-native";
import { colors } from "../../../constants/colors";

interface AvatarProps {
	uri?: string | undefined;
	position: "left" | "right";
}

export const Avatar: React.FC<AvatarProps> = ({ uri, position }) => {
	return (
		<View
			style={[
				styles.container,
				position === "left" ? styles.leftContainer : styles.rightContainer,
			]}
		>
			<Image source={{ uri }} style={styles.image} />
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
});
