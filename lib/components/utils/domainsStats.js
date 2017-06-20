'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = domainStats;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var colors = require('d3').scale.category10().range();

function domainStats(genetree) {
  var speciesNodes = genetree.leafNodes();
  var numGenes = speciesNodes.length;
  var colorIdx = 0;
  return speciesNodes.reduce(function (map, node) {
    var domains = _lodash2.default.get(node, 'model.domains');
    var geneId = _lodash2.default.get(node, 'model.gene_stable_id');

    if (_lodash2.default.isArray(domains)) {
      _lodash2.default.forEach(domains, function (domain) {
        var id = domain.id;
        var mapValue = map[id];
        if (!mapValue) {
          map[id] = mapValue = {
            totalGenes: numGenes,
            genesWithDomain: 0,
            nodes: {},
            color: colors[colorIdx++ % colors.length]
          };
        }
        if (!mapValue.nodes[geneId]) {
          mapValue.nodes[geneId] = node;
          mapValue.genesWithDomain++;
        }
      });
    }

    return map;
  }, {});
}