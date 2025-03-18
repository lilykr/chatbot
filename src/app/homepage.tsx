import { StyleSheet, View } from "react-native";
import { Text } from "../components/Text";
import { SearchBar } from "../components/SearchBar";
import { colors } from "../constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardButton } from "../components/CardButton";
import { Link } from "expo-router";

export default function Homepage() {
	return (
		<SafeAreaView style={styles.layout}>
			<Text
				weight="medium"
				style={{ color: "white", fontSize: 28, width: "70%" }}
			>
				Create, explore, be inspired
			</Text>
			<SearchBar />
			<View style={styles.buttonContainer}>
				<Link href="/chat">
					<CardButton
						text="AI text writer"
						backgroundColor={colors.night}
						borderColor={colors.lightGrey}
					/>
				</Link>
				<Link href="/voiceMode">
					<CardButton
						text="AI Voice mode"
						backgroundColor={colors.night}
						borderColor={colors.lightGrey}
					/>
				</Link>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	layout: {
		flex: 1,
		backgroundColor: colors.night,
		marginHorizontal: 16,
	},
	buttonContainer: {
		flexDirection: "row",
		gap: 16,
		marginTop: 24,
	},
});
