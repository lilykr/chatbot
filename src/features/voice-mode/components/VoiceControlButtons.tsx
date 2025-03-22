import Ionicons from "@expo/vector-icons/Ionicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BouncyPressable } from "../../../components/BouncyPressable";
import { RoundButton } from "../../../components/RoundButton";

interface IconButtonProps {
	onPress?: () => void;
	onClose?: () => void;
	onRefresh?: () => void;
}

export const VoiceControlButtons = ({
	onPress,
	onClose,
	onRefresh,
}: IconButtonProps) => {
	const safeAreaInsets = useSafeAreaInsets();
	return (
		<View
			style={[styles.container, { marginBottom: safeAreaInsets.bottom + 32 }]}
		>
			<BouncyPressable onPress={onClose}>
				<Ionicons name="close-outline" size={30} color="white" />
			</BouncyPressable>
			<RoundButton onPress={onPress}>
				<SimpleLineIcons name="microphone" size={28} color="white" />
			</RoundButton>
			<BouncyPressable onPress={onRefresh}>
				<Ionicons name="refresh-outline" size={30} color="white" />
			</BouncyPressable>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-around",
		width: "80%",
		alignSelf: "center",
		alignItems: "center",
	},
});
