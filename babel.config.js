module.exports = (api) => {
	api.cache(true);
	return {
		presets: ["babel-preset-expo"],
		plugins: ["@babel/plugin-transform-class-static-block"],
	};
};
