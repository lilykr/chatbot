export const isFrench = (req: Request) => {
	const locale = req.headers.get("x-locale");
	return locale?.includes("fr");
};
