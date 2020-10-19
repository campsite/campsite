const path = require('path');

module.exports = {
    webpackDevMiddleware: (config) => {
        config.watchOptions = {
            poll: 1000,
            aggregateTimeout: 300,
        };
        return config;
    },

    webpack: (config, options) => {
        if (!options.isServer && config.mode === 'development') {
            const { I18NextHMRPlugin } = require('i18next-hmr/plugin');
            config.plugins.push(
                new I18NextHMRPlugin({
                    localesDir: path.resolve(__dirname, 'public/static/locales')
                })
            );
        }
        return config;
    }
};