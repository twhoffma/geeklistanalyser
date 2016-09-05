var l = require('winston');

l.remove(l.transports.Console);
l.add(l.transports.Console, {colorize: true});

module.exports.info = l.info;
module.exports.warn = l.warn;
module.exports.error = l.error;
