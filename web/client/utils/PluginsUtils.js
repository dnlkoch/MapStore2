/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');
const {omit, isObject, head, isArray} = require('lodash');
const {combineReducers} = require('redux');

const isPluginConfigured = (pluginsConfig, plugin) => {
    const cfg = pluginsConfig;
    const pluginName = plugin.substring(0, plugin.length - 6);
    return head(cfg.filter((cfgObj) => cfgObj.name === pluginName || cfgObj === pluginName));
};

const isHiddenIn = (cfg, name) => {
    return cfg.hideFrom && cfg.hideFrom.indexOf(name) !== -1;
};

const getPluginItems = (plugins, pluginsConfig, name) => {
    return Object.keys(plugins)
            .filter((plugin) => plugins[plugin][name])
            .filter((plugin) => {
                const cfgObj = isPluginConfigured(pluginsConfig, plugin);
                return cfgObj && !isHiddenIn(cfgObj, name);
            })
            .map((plugin) => {
                const pluginImpl = plugins[plugin];
                const pluginName = plugin.substring(0, plugin.length - 6);
                const pluginCfg = isPluginConfigured(pluginsConfig, plugin);
                return assign({},
                    pluginImpl[name],
                    {
                        cfg: pluginCfg && pluginCfg.cfg || undefined
                    },
                    {
                        plugin: pluginImpl,
                        items: getPluginItems(plugins, pluginsConfig, pluginName)
                    });
            });
};

/*eslint-disable */
const parseExpression = (requires, value) => {
    const searchExpression = /^\{(.*?)\}$/;
    const context = requires || {};
    const expression = searchExpression.exec(value);
    if (expression !== null) {
        return eval(expression[1]);
    }
    return value;
};
/*eslint-enable */


const parsePluginConfig = (requires, cfg) => {
    if (isArray(cfg)) {
        return cfg.map((value) => parsePluginConfig(requires, value));
    }
    if (isObject(cfg)) {
        return Object.keys(cfg).reduce((previous, current) => {
            const value = cfg[current];
            return assign(previous, {[current]: parsePluginConfig(requires, value)});
        }, {});
    }
    return parseExpression(requires, cfg);
};
const getReducers = (plugins) => Object.keys(plugins).map((name) => plugins[name].reducers)
                            .reduce((previous, current) => assign({}, previous, current), {});
const PluginsUtils = {
    combineReducers: (plugins, reducers) => {
        const pluginsReducers = getReducers(plugins);
        return combineReducers(assign({}, reducers, pluginsReducers));
    },
    getReducers,
    getPlugins: (plugins) => Object.keys(plugins).map((name) => plugins[name])
                                .reduce((previous, current) => assign({}, previous, omit(current, 'reducers')), {}),
    getPluginDescriptor: (plugins, pluginsConfig, pluginDef) => {
        const name = isObject(pluginDef) ? pluginDef.name : pluginDef;
        const impl = plugins[(isObject(pluginDef) ? pluginDef.name : pluginDef) + 'Plugin'];
        return {
            name,
            impl,
            cfg: isObject(pluginDef) ? parsePluginConfig(plugins.requires, pluginDef.cfg) : {},
            items: getPluginItems(plugins, pluginsConfig, name)
        };
    }
};
module.exports = PluginsUtils;
