import { Text as RNText, type TextProps } from "react-native";
import { font } from "../constants/font";

type Props = TextProps & {
	weight?: "regular" | "medium" | "bold" | "semibold";
};

export const Text = ({ weight = "regular", ...props }: Props) => {
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
