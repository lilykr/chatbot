import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { font } from "../constants/font";

export type TextProps = RNTextProps & {
	weight?: "regular" | "medium" | "bold" | "semibold";
};

export const Text = ({ weight = "regular", ...props }: TextProps) => {
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
