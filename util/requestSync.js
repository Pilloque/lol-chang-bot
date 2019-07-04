const request = require("request");

module.exports = function (url) {
    return new Promise((resolve, reject) => {
        request(url, { json: true }, async (error, response, body) => {
            if (error) reject(error);

            resolve(body);
        });
    });
};