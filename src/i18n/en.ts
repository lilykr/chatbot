const en = {
	"common.hello": "Hello",
	"common.welcome": "Welcome to our app",
	"common.back": "Back",
	"common.next": "Next",
	"common.cancel": "Cancel",
	"common.save": "Save",
	"common.delete": "Delete",
	"common.loading": "Loading...",

	"auth.signIn": "Sign In",
	"auth.signUp": "Sign Up",
	"auth.email": "Email",
	"auth.password": "Password",
	"auth.forgotPassword": "Forgot Password?",
	"auth.noAccount": "Don't have an account?",

	"errors.required": "This field is required",
	"errors.invalidEmail": "Please enter a valid email",
	"errors.networkError": "Network error, please try again",
	"errors.unknown": "An unknown error occurred",
};

export default en;

// Type definition based on the flattened structure
export type TranslationId = keyof typeof en;
