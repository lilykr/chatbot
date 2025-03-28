import type { TranslationId } from "./en";

// Using Record to ensure all keys from TranslationId are present
const fr: Record<TranslationId, string> = {
	"common.hello": "Bonjour",
	"common.welcome": "Bienvenue dans notre application",
	"common.back": "Retour",
	"common.next": "Suivant",
	"common.cancel": "Annuler",
	"common.save": "Enregistrer",
	"common.delete": "Supprimer",
	"common.loading": "Chargement...",

	"auth.signIn": "Se connecter",
	"auth.signUp": "S'inscrire",
	"auth.email": "Email",
	"auth.password": "Mot de passe",
	"auth.forgotPassword": "Mot de passe oublié ?",
	"auth.noAccount": "Vous n'avez pas de compte ?",

	"errors.required": "Ce champ est obligatoire",
	"errors.invalidEmail": "Veuillez entrer un email valide",
	"errors.networkError": "Erreur réseau, veuillez réessayer",
	"errors.unknown": "Une erreur inconnue s'est produite",
};

export default fr;
