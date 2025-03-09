import {
	Epilogue_400Regular,
	Epilogue_500Medium,
	Epilogue_800ExtraBold,
	useFonts,
} from "@expo-google-fonts/epilogue";
import { Platform, Text as RNText, type TextProps } from "react-native";

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
					fontFamily:
						weight === "regular"
							? Platform.OS === "android"
								? "Epilogue_400Regular"
								: "Epilogue-Regular"
							: weight === "medium"
								? Platform.OS === "android"
									? "Epilogue_500Medium"
									: "Epilogue-Medium"
								: Platform.OS === "android"
									? "Epilogue_800ExtraBold"
									: "Epilogue-ExtraBold",
				},
				props.style,
			]}
		/>
	);
};
