import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { SearchBar } from "../../components/SearchBar";
import { Text } from "../../components/Text";
import { MeshGradient } from "../MeshGradient/MeshGradient";

export const Homepage = () => {
	return (
		<>
			<MeshGradient />

			<SafeAreaView style={styles.layout}>
				<Text
					weight="medium"
					style={{ color: "white", fontSize: 28, width: "70%" }}
				>
					Create, explore, be inspired
				</Text>
				<SearchBar />
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	layout: {
		flex: 1,
		// backgroundColor: colors.night,
		marginHorizontal: 16,
		zIndex: 100,
	},
});
