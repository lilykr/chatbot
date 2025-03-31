// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Force server to use HTTPS and tunneling
config.server = {
    ...config.server,
    useSSL: true,
    enhanceMiddleware: (middleware) => {
        return (req, res, next) => {
            // Force the host header to be the tunnel URL if available
            const tunnelHost = process.env.EXPO_TUNNEL_HOSTNAME;
            if (tunnelHost) {
                req.headers.host = tunnelHost;
            }
            return middleware(req, res, next);
        };
    },
};

module.exports = config;
