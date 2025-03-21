import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoundButton } from "../../../components/RoundButton";

interface IconButtonProps {
	onPress?: () => void;
}

export const VoiceControlButtons = ({ onPress }: IconButtonProps) => {
	const safeAreaInsets = useSafeAreaInsets();
	return (
		<View style={{ marginBottom: safeAreaInsets.bottom + 32 }}>
			<RoundButton onPress={onPress}>
				<SimpleLineIcons name="microphone" size={28} color="white" />
			</RoundButton>
		</View>
	);
};
