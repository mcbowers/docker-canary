'use strict';
const colors = require('colors');

module.exports.error = (message) => {
    console.log(`${message}`.red);
}

module.exports.info = (message) => {
    console.log(`${message}`.yellow);
}

module.exports.debug = (message) => {
    console.log(`${message}`.cyan);
}
