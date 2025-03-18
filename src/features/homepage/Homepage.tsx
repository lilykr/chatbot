import { SafeAreaView, StyleSheet, View } from "react-native";
import { Text } from "../../components/Text";
import { SearchBar } from "../../components/SearchBar";
export const Homepage = () => {
	return (
		<SafeAreaView style={styles.layout}>
			<Text style={{ color: "white" }}>Homepage</Text>
			<SearchBar />
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	layout: {
		flex: 1,
		backgroundColor: "black",
	},
});
