import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { colors } from "../constants/colors";

interface SearchBarProps {
	onSearch?: (query: string) => void;
	placeholder?: string;
	style?: object;
}

export const SearchBar = ({
	onSearch,
	placeholder = "Search...",
	style = {},
}: SearchBarProps) => {
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = (text: string) => {
		setSearchQuery(text);
		if (onSearch) {
			onSearch(text);
		}
	};

	return (
		<View style={[styles.container, style]}>
			<View style={styles.overlay} />
			<Ionicons
				name="search"
				size={23}
				color={colors.lightGrey}
				style={styles.searchIcon}
			/>
			<TextInput
				keyboardAppearance="dark"
				style={styles.input}
				placeholder={placeholder}
				value={searchQuery}
				onChangeText={handleSearch}
				clearButtonMode="while-editing"
				autoCapitalize="none"
				autoCorrect={false}
				placeholderTextColor={colors.lightGrey}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 16,
		borderRadius: 50,
		marginVertical: 8,
		borderWidth: 1,
		borderColor: colors.lightGrey,
		overflow: "hidden",
		padding: 8,
		flexDirection: "row",
		alignItems: "center",
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "black",
		opacity: 0.5,
	},
	searchIcon: {
		marginRight: 8,
	},
	input: {
		height: 30,
		fontSize: 16,
		color: colors.lightGrey,
		flex: 1,
	},
});
