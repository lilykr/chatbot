import { View, TextInput, StyleSheet } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { BlurView } from "expo-blur";

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
			<BlurView intensity={60} tint="dark" style={styles.blurContainer}>
				<Ionicons
					name="search"
					size={23}
					color={colors.lightGrey}
					style={styles.searchIcon}
				/>
				<TextInput
					style={styles.input}
					placeholder={placeholder}
					value={searchQuery}
					onChangeText={handleSearch}
					clearButtonMode="while-editing"
					autoCapitalize="none"
					autoCorrect={false}
					placeholderTextColor={colors.lightGrey}
				/>
			</BlurView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		borderRadius: 50,
		marginVertical: 8,
		borderWidth: 1,
		borderColor: colors.lightGrey,
		overflow: "hidden",
	},
	blurContainer: {
		padding: 8,
		flexDirection: "row",
		alignItems: "center",
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
