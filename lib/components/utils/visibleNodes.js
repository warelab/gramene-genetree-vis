'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeNodeVisible = makeNodeVisible;
exports.makeNodeInvisible = makeNodeInvisible;
exports.makeCladeVisible = makeCladeVisible;
exports.makeCladeInvisible = makeCladeInvisible;
exports.calculateXIndex = calculateXIndex;
exports.setDefaultNodeDisplayInfo = setDefaultNodeDisplayInfo;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeNodeVisible(node) {
  node.displayInfo.expanded = true;
}

function makeNodeInvisible(node) {
  node.displayInfo.expanded = false;
}

function makeCladeVisible(node) {
  node.walk(makeNodeVisible);
}

function makeCladeInvisible(node) {
  node.walk(makeNodeInvisible);
}

function calculateXIndex(genetree) {
  var visibleUnexpanded = []; // array of unexpanded nodes that are visible

  function calcXIndexFor(node) {
    if (node.displayInfo.expanded && node.children.length > 0) {

      if (node.children.length === 2) {
        var leftExtrema = calcXIndexFor(node.children[0]); // left child
        var rightExtrema = calcXIndexFor(node.children[1]); // right child
        node.xindex = (rightExtrema.min + leftExtrema.max) / 2; // midpoint
        return {
          min: leftExtrema.min,
          max: rightExtrema.max
        };
      } else {
        var childExtrema = calcXIndexFor(node.children[0]);
        node.xindex = node.children[0].xindex;
        return {
          min: childExtrema.min,
          max: childExtrema.max
        };
      }
    } else {
      visibleUnexpanded.push(node);
      node.xindex = visibleUnexpanded.length;
      return {
        min: node.xindex,
        max: node.xindex
      };
    }
  }

  var treeExtrema = calcXIndexFor(genetree);
  genetree.maxXindex = treeExtrema.max;
  genetree.minXindex = treeExtrema.min;
}

function setDefaultNodeDisplayInfo(genetree, geneOfInterest) {
  var pathIds = getPathIds();
  var paralogPathIds = getParalogPathIds();
  var orthologPathIds = getOrthologPathIds();

  genetree.walk(function (node) {
    var nodeId = node.model.node_id;
    var isLeafNode = !!node.model.gene_stable_id;
    var onlyChild = node.children && node.children.length === 1;
    var displayInfo = {
      expanded: false,
      leafNode: isLeafNode,
      isGeneOfInterest: node.model.gene_stable_id === geneOfInterest._id
    };
    if (!!pathIds[nodeId]) {
      displayInfo.expanded = true;
      displayInfo.expandedBecause = pathIds[nodeId];
    } else if (node.parent) {
      var parentNodeId = node.parent.model.node_id;

      if ((isLeafNode || onlyChild) && pathIds[parentNodeId]) {
        displayInfo.expanded = true;
        displayInfo.expandedBecause = pathIds[parentNodeId];
        pathIds[node.model.node_id] = [node];
      }
    }

    displayInfo.paralogs = paralogPathIds ? paralogPathIds[nodeId] : [];
    displayInfo.orthologs = orthologPathIds ? orthologPathIds[nodeId] : [];

    node.displayInfo = displayInfo;
  });

  function getPathIds() {
    var representatives = _lodash2.default.get(geneOfInterest.homology.gene_tree, 'representative');

    // get nodes of representatives and gene of interest.
    var nodesToExpand = representatives ? _lodash2.default.map(representatives, function (rep) {
      return idToNode(rep.id);
    }) : [];
    nodesToExpand.push(idToNode(geneOfInterest._id));

    // get and index all node_ids in the paths for those nodes.
    // these are the ones that should be expanded by default.
    return _lodash2.default.reduce(nodesToExpand, nodesToPathIds, {});
  }

  function pathIdsImpl(path) {
    var ids = _lodash2.default.get(geneOfInterest, path);
    var nodes = _lodash2.default.map(ids, idToNode);
    return _lodash2.default.reduce(nodes, nodesToPathIds, {});
  }

  function getParalogPathIds() {
    return pathIdsImpl('homology.homologous_genes.within_species_paralog');
  }

  function getOrthologPathIds() {
    var keys = _lodash2.default.keys(_lodash2.default.get(geneOfInterest, 'homology.homologous_genes')).map(function (key) {
      return 'homology.homologous_genes.' + key;
    });
    var filteredKeys = _lodash2.default.filter(keys, function (key) {
      return key.indexOf('ortholog') > -1;
    });
    var pathIdsArray = _lodash2.default.map(filteredKeys, pathIdsImpl);
    return _lodash2.default.reduce(pathIdsArray, function (acc, obj) {
      return _lodash2.default.mergeWith(acc, obj, function mergeIndexedPathIds(accVal, objVal) {
        return _lodash2.default.isArray(accVal) ? accVal.concat(objVal) : objVal;
      });
    });
  }

  function idToNode(id) {
    return genetree.indices.gene_stable_id[id];
  }

  function nodesToPathIds(acc, node) {
    // take an array of nodes, return an object with
    // key: pathNodeId
    // value: array of actual nodes (not the ones in the path).
    if (!node) return acc;

    var paralogPairs = _lodash2.default.map(node.getPath(), function (n) {
      return [n.model.node_id, node];
    });
    var paralogLUT = _lodash2.default.fromPairs(paralogPairs);

    return _lodash2.default.assignWith(acc, paralogLUT, function (accVal, srcVal) {
      return _lodash2.default.isUndefined(accVal) ? [srcVal] : _lodash2.default.concat(accVal, srcVal);
    });
  }
}