import * as Localization from "expo-localization";
import { MMKV } from "react-native-mmkv";
import { i18n } from "./index";

// Storage for saving language preference
const storage = new MMKV();
const LANGUAGE_KEY = "user_language_preference";

// Get the device's locale and extract the language code
export const getDeviceLanguage = (): string => {
	const locale = Localization.locale;
	// Extract language code (e.g., 'en' from 'en-US')
	return locale.split("-")[0]!;
};

// Get saved language or use device language
export const getSavedLanguage = (): string => {
	const savedLanguage = storage.getString(LANGUAGE_KEY);
	return savedLanguage || getDeviceLanguage();
};

// Save language preference
export const saveLanguage = (languageCode: string): void => {
	storage.set(LANGUAGE_KEY, languageCode);
	i18n.locale = languageCode;
};

// Check if the language is supported
export const isLanguageSupported = (languageCode: string): boolean => {
	// Check if we have translations for this language
	return Object.keys(i18n.translations).includes(languageCode);
};

// Get available languages
export const getAvailableLanguages = (): { code: string; name: string }[] => {
	return [
		{ code: "en", name: "English" },
		{ code: "fr", name: "Français" },
		// Add more languages as you support them
	];
};
