import type React from "react";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Option {
	id: string;
	label: string;
}

interface OptionSelectorProps {
	options: Option[];
	onSelect?: (option: Option) => void;
	defaultSelected?: string;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({
	options,
	onSelect,
	defaultSelected,
}) => {
	const [selectedId, setSelectedId] = useState<string | undefined>(
		defaultSelected,
	);

	const handleSelect = (option: Option) => {
		setSelectedId(option.id);
		onSelect?.(option);
	};

	return (
		<View style={styles.container}>
			{options.map((option) => (
				<TouchableOpacity
					key={option.id}
					style={styles.optionContainer}
					onPress={() => handleSelect(option)}
				>
					<View style={styles.radioOuter}>
						{selectedId === option.id && <View style={styles.radioInner} />}
					</View>
					<Text style={styles.optionText}>{option.label}</Text>
				</TouchableOpacity>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 16,
	},
	optionContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		backgroundColor: "#fff",
		borderRadius: 8,
		marginBottom: 8,
		paddingHorizontal: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	radioOuter: {
		height: 24,
		width: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "#007AFF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 10,
	},
	radioInner: {
		height: 12,
		width: 12,
		borderRadius: 6,
		backgroundColor: "#007AFF",
	},
	optionText: {
		fontSize: 16,
		color: "#333",
	},
});
