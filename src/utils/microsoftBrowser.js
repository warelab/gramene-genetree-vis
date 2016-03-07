var platform = require('platform');

module.exports = platform.name === 'IE' || platform.name === 'Microsoft Edge';