'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var scale = require('d3').scale.linear;
var calculateIdentity = require('gramene-trees-client').extensions.identity;

function relateNodesToGeneOfInterest(genetree, geneOfInterest, taxonomy, pivotTree) {
  if (pivotTree) {
    var node = genetree.indices.gene_stable_id[geneOfInterest._id];

    var indexCallback = function indexCallback(n) {
      return n === node;
    };

    while (!node.isRoot()) {
      var parent = node.parent;
      var children = parent.children;
      var nodeIdx = _lodash2.default.findIndex(children, indexCallback);

      // move this node to the front of the children array.
      if (nodeIdx) {
        children.splice(0, 0, children.splice(nodeIdx, 1)[0]);
      }
      node = parent;
    }
  }
  // (re)initialize relationships
  // genetree.walk(function (node) {
  //   node.relationToGeneOfInterest = {};
  // });
  addHomologyInformationToNodes(genetree, geneOfInterest);
  addTaxonDistanceInformationToNodes(genetree, geneOfInterest, taxonomy);
}

function addHomologyInformationToNodes(genetree, theGene) {
  if (theGene) {
    var theGeneNode = genetree.indices.gene_stable_id[theGene._id];
    var homologs = indexHomologs(theGene);
    var representatives = indexReps(theGene);
    genetree.walk(function (node) {
      var homology = void 0;
      var nodeId = node.model.gene_stable_id;
      node.relationToGeneOfInterest = {};
      if (nodeId) {
        if (nodeId === theGene._id) {
          homology = 'self';
        } else {
          homology = homologs[nodeId];
        }
        node.relationToGeneOfInterest.identity = calculateIdentity(theGeneNode, node);
        node.relationToGeneOfInterest.homology = homology;
        node.relationToGeneOfInterest.repType = representatives[nodeId];
      }
    });
  }
}

// IN -> key: homologyType, value: [geneId]
// OUT-> key: geneId, value: homologyType
function indexHomologs(theGene) {
  var homologs = _lodash2.default.get(theGene, 'homology.homologous_genes');
  return _lodash2.default.transform(homologs, function (result, value, key) {
    _lodash2.default.forEach(value, function (id) {
      result[id] = key;
    });
    return result;
  }, {});
}

// IN -> key: representativeType, value: gene doc
// OUT-> key: geneId, value: representativeType
function indexReps(theGene) {
  var representative = _lodash2.default.get(theGene, 'homology.gene_tree.representative');
  return _lodash2.default.transform(representative, function (result, rep, repType) {
    result[rep.id] = repType;
    return result;
  }, {});
}

function addTaxonDistanceInformationToNodes(genetree, geneOfInterest, taxonomy) {
  /*const*/var OUTGROUP_FLAG = -1;

  var theGeneTaxonId = geneOfInterest.taxon_id;

  if (theGeneTaxonId && taxonomy) {
    var theTaxonNode = taxonomy.indices.id[theGeneTaxonId];
    var theTaxonPath = theTaxonNode.getPath();
    var theTaxonPathIds = _lodash2.default.keyBy(theTaxonPath, 'model.id');
    var relationLUT = {};
    var maxima = {
      lcaDistance: 0,
      pathDistance: 0
    };

    genetree.walk(function (node) {
      var nodeTaxonId = node.model.taxon_id || node.model.node_taxon_id;

      // have we already seen this?
      if (relationLUT[nodeTaxonId]) {
        node.relationToGeneOfInterest.taxonomy = relationLUT[nodeTaxonId];
      } else {
        var lcaDistance = 0;
        var pathDistance = 0;
        var lca = void 0;
        if (nodeTaxonId !== theGeneTaxonId) {
          if (lca = theTaxonPathIds[nodeTaxonId]) {
            pathDistance = 0;
          } else {
            var nodeTaxon = taxonomy.indices.id[nodeTaxonId];
            if (nodeTaxon) {
              lca = theTaxonNode.lcaWith([nodeTaxon]);
              pathDistance = lca.pathTo(nodeTaxon).length - 1;
            } else {
              pathDistance = OUTGROUP_FLAG;
            }
          }

          if (pathDistance === OUTGROUP_FLAG) {
            lcaDistance = OUTGROUP_FLAG;
          } else {
            lcaDistance = theTaxonPath.length - _lodash2.default.indexOf(theTaxonPath, lca) - 1;
          }
        }

        var distances = {
          lcaDistance: lcaDistance,
          pathDistance: pathDistance,
          maxima: maxima
        };

        maxima.lcaDistance = Math.max(maxima.lcaDistance, distances.lcaDistance);
        maxima.pathDistance = Math.max(maxima.pathDistance, distances.pathDistance);

        relationLUT[nodeTaxonId] = node.relationToGeneOfInterest.taxonomy = distances;
      }
    });

    // any taxa we don't have in the taxonomy tree, we will set to the max values seen.
    // it's ok to modify values in the LUT because these point to the same refs as the nodes.
    _lodash2.default.forIn(relationLUT, function updateOutgroupTaxa(distances) {
      if (distances.lcaDistance === OUTGROUP_FLAG) {
        distances.lcaDistance = maxima.lcaDistance;
        distances.pathDistance = maxima.pathDistance;
      }
    });

    maxima.colorScale = scale().domain([0, maxima.lcaDistance + maxima.pathDistance]).range(['green', 'red']);
  }
}

exports.default = relateNodesToGeneOfInterest;