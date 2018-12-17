const debug = require("debug")("module:client");
const queryString = require('query-string');
const http = require('./http');

module.exports = function Client(specs, options) {
    let client = {};

    options = options || {};

    specs.baseUrl = specs.baseUrl || options.baseUrl || undefined;

    // translate operations
    if (specs.operations) {
        for (let operationKey in specs.operations) {
            let operation = specs.operations[operationKey];

            client[operationKey] = function(data, callback) {
                debug("call method:", operationKey);
                debug("with data:", JSON.stringify(data));

                let url = specs.baseUrl + operation.uri;
                let method = operation.method || 'get';
                let headers = {};
                let body;

                // translate data
                if (operation.data) {
                    for (let position in operation.data) {
                        debug("translating data:", position);
                        let parameters = {};

                        for (let parameter of operation.data[position].parameters) {
                            debug("Parameter:", JSON.stringify(parameter));

                            if (parameter.name && parameter.default) {
                                parameters[parameter.name] = parameter.default;
                            }

                            if (parameter.name && data && (data[parameter.name] || data[parameter.as])) {
                                parameters[parameter.name] = data[parameter.name] || data[parameter.as] || parameter.default;
                            }
                            else if (parameter.required) {
                                throw `Required parameter is missing:${parameter.name}`;
                            }
                        }

                        debug("Aggregated Parameters:", JSON.stringify(parameters));

                        if (position === "body") {
                            if (!operation.data[position].type) {
                                body = queryString.stringify(parameters);
                            }
                            else if (operation.data[position].type === "application/x-www-form-urlencoded") {
                                headers["Content-Type"] = operation.data[position].type;
                                body = queryString.stringify(parameters);
                            }

                        }
                        else if (position === "query") {
                            if (parameters && Object.keys(parameters).length > 0) {
                                if (url.indexOf("?") > -1) {
                                    url += "&";
                                }
                                else {
                                    url += "?";
                                }

                                url += queryString.stringify(parameters);
                            }
                        }
                        else if (position === "header") {
                            headers = parameters;
                        }
                        else if (position === "path") {
                            for (let parameter in parameters) {
                                url = url.replace(`{${parameter}}`, parameters[parameter]);
                            }
                        }
                    }
                }

                if (options.mock) {
                    return resolve(callback, {
                        request: {
                            url: url,
                            method: method.toUpperCase(),
                            headers: headers,
                            body: body
                        }
                    });
                }
                else {
                    return http(url, method.toUpperCase(), headers, body)
                        .then(function(response) {
                            return resolve(callback, response);
                        });
                }
            }
        }
    }

    return client;
}

function resolve(callback, result) {

    if (callback && callback instanceof Function) {
        callback(null, result);
    }

    return Promise.resolve(result);
}
