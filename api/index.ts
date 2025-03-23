const { createRequestHandler } = require("@expo/server/adapter/vercel");

module.exports = createRequestHandler({
	// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
	build: require("path").join(__dirname, "../dist/server"),
});
