import { Text, type TextProps } from "react-native";
import { type TranslationId, useI18n } from "./index";

type FormattedTextProps = TextProps & {
	/**
	 * The translation key to look up in your translations
	 */
	id: TranslationId;
	/**
	 * Variables to interpolate into the translation
	 */
	values?: Record<string, string | number>;
	/**
	 * Default text to show if the translation is not found
	 */
	defaultMessage?: string;
};

/**
 * A component that renders translated text based on the current locale
 *
 * Example:
 * ```tsx
 * <FormattedText id="en.common.hello" values={{ name: "John" }} style={styles.text} />
 * ```
 */
export const FormattedText: React.FC<FormattedTextProps> = ({
	id,
	values,
	defaultMessage,
	...textProps
}) => {
	const { t } = useI18n();

	// Try to get the translation or fall back to default message or the key itself
	const translatedText = t(id) || defaultMessage || id;

	// Handle variable substitution if values are provided
	let finalText = translatedText;
	if (values) {
		finalText = Object.entries(values).reduce(
			(text, [key, value]) =>
				text.replace(new RegExp(`{{${key}}}`, "g"), String(value)),
			translatedText,
		);
	}

	return <Text {...textProps}>{finalText}</Text>;
};

export default FormattedText;
