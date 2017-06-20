'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _platform = require('platform');

var _platform2 = _interopRequireDefault(_platform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _platform2.default.name === 'IE' || _platform2.default.name === 'Microsoft Edge';