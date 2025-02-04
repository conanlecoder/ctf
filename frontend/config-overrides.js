const webpack = require("webpack");

module.exports = function override(config) {
    config.resolve.fallback = {
        fs: false, // Disable fs module
        path: require.resolve("path-browserify"),
        os: require.resolve("os-browserify/browser"),
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        assert: require.resolve("assert"),
    };

    return config;
};
