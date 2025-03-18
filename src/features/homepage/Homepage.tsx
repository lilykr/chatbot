import { StyleSheet, View } from "react-native";
import { Text } from "../../components/Text";
import { SearchBar } from "../../components/SearchBar";
import { colors } from "../../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
export const Homepage = () => {
	return (
		<SafeAreaView style={styles.layout}>
			<Text
				weight="medium"
				style={{ color: "white", fontSize: 28, width: "70%" }}
			>
				Create, explore, be inspired
			</Text>
			<SearchBar />
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	layout: {
		flex: 1,
		backgroundColor: colors.night,
		marginHorizontal: 16,
	},
});
