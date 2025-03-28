import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import en, { TranslationId } from "./en";
import fr from "./fr";

// Create the i18n instance
const i18n = new I18n({
	...en,
	...fr,
});

// Set the locale based on device language
i18n.locale = Localization.getLocales()[0]?.languageCode ?? "en";
i18n.defaultLocale = "en";
i18n.enableFallback = true;

// Create the context with typed t function
type I18nContextType = {
	t: (scope: TranslationId) => string;
	locale: string;
	setLocale: (locale: string) => void;
};

const I18nContext = createContext<I18nContextType>({
	t: (scope: TranslationId) => i18n.t(scope),
	locale: i18n.locale,
	setLocale: () => {},
});

// Create the provider component
type I18nProviderProps = {
	children: ReactNode;
};

export const I18nProvider = ({ children }: I18nProviderProps) => {
	const [locale, setLocale] = useState(i18n.locale);

	useEffect(() => {
		// Update the i18n locale when the locale state changes
		i18n.locale = locale;
	}, [locale]);

	// Provide translation function and locale management
	const value = {
		t: (scope: TranslationId) => i18n.t(scope),
		locale,
		setLocale,
	};

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// Create a hook to use the i18n context
export const useI18n = () => {
	const context = useContext(I18nContext);
	if (context === undefined) {
		throw new Error("useI18n must be used within an I18nProvider");
	}
	return context;
};

// Export the i18n instance for direct access if needed
export { i18n };

// Export type for use in other files
export { TranslationId };
