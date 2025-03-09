import {
	Epilogue_400Regular,
	Epilogue_500Medium,
	Epilogue_800ExtraBold,
	useFonts,
} from "@expo-google-fonts/epilogue";
import { Text as RNText, type TextProps } from "react-native";
import { font } from "../constants/font";

type Props = TextProps & {
	weight?: "regular" | "medium" | "bold";
};

export const Text = ({ weight = "regular", ...props }: Props) => {
	const [fontsLoaded] = useFonts({
		Epilogue_400Regular,
		Epilogue_500Medium,
		Epilogue_800ExtraBold,
	});

	if (!fontsLoaded) {
		return null; // Or return a loading placeholder
	}

	return (
		<RNText
			{...props}
			style={[
				{
					fontFamily: font[weight],
				},
				props.style,
			]}
		/>
	);
};
