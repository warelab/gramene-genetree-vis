var scale = require('d3').scale.linear;
var _ = require('lodash');

function addDisplayInfo(genetree, geneOfInterest) {
  var paralogPathIds, orthologPathIds, pathIds;

  pathIds = getPathIds(geneOfInterest);
  paralogPathIds = getParalogPathIds();
  orthologPathIds = getOrthologPathIds();

  genetree.walk(function (node) {
    var nodeId, isLeafNode, parentNodeId, displayInfo;
    nodeId = node.model.node_id;
    isLeafNode = !!node.model.gene_stable_id;
    displayInfo = {
      expanded: false,
      leafNode: isLeafNode
    };

    if (!!pathIds[nodeId]) {
      displayInfo.expanded = true;
      displayInfo.expandedBecause = pathIds[nodeId];
    }
    else {
      parentNodeId = node.parent.model.node_id;

      if (isLeafNode && pathIds[parentNodeId]) {
        displayInfo.expanded = true;
        displayInfo.expandedBecause = pathIds[parentNodeId];
      }
    }

    if (displayInfo.expanded) {
      displayInfo.paralogs = paralogPathIds[nodeId];
      displayInfo.orthologs = orthologPathIds[nodeId];
    }

    node.displayInfo = displayInfo;
  });

  function getPathIds() {
    var nodesToExpand, repIds;

    // get node_ids of representatives and gene of interest.
    repIds = _.values(geneOfInterest.representative).map(function (rep) { return rep.id; });
    nodesToExpand = _.map(repIds, idToNode);
    nodesToExpand.push(idToNode(geneOfInterest._id));

    // get and index all node_ids in the paths for those nodes.
    // these are the ones that should be expanded by default.
    return _.reduce(nodesToExpand, nodesToPathIds, {});
  }

  function pathIdsImpl(path) {
    var ids, nodes;
    ids = _.get(geneOfInterest, path);
    nodes = _.map(ids, idToNode);
    return _.reduce(nodes, nodesToPathIds, {});
  }

  function getParalogPathIds() {
    return pathIdsImpl('homology.within_species_paralog');
  }

  function getOrthologPathIds() {
    var keys, filteredKeys, pathIdsArray, result;
    keys = _.keys(geneOfInterest.homology).map(function (key) { return 'homology.' + key; });
    filteredKeys = _.filter(keys, function (key) { return key.indexOf('ortholog') > -1; });
    pathIdsArray = _.map(filteredKeys, pathIdsImpl);
    result = _.reduce(pathIdsArray, function (acc, obj) {
      return _.mergeWith(acc, obj, function mergeIndexedPathIds(accVal, objVal) {
        return _.isArray(accVal) ? accVal.concat(objVal) : objVal;
      });
    });
    return result;
  }

  function idToNode(id) {
    return genetree.indices.gene_stable_id[id];
  }

  function nodesToPathIds(acc, node) {
    // take an array of nodes, return an object with
    // key: pathNodeId
    // value: array of actual nodes (not the ones in the path).

    var paralogPairs, paralogLUT;
    paralogPairs = _.map(node.getPath(), function (n) {
      return [n.model.node_id, node];
    });
    paralogLUT = _.fromPairs(paralogPairs);

    return _.assignWith(acc, paralogLUT, function (accVal, srcVal) {
      return _.isUndefined(accVal) ? [srcVal] : _.concat(accVal, srcVal);
    });
  }
}

function calculateXIndex(genetree) {
  var maxXindex, minXindex;
  maxXindex = -Infinity;
  minXindex = Infinity;
  function calcXIndexFor(node, offset) {
    var offsetIncrement, correctedLeftIndex, correctedRightIndex;
    correctedLeftIndex = node.model.left_index - offset;
    if (node.displayInfo.expanded) {
      offsetIncrement = 0;
      if (_.isArray(node.children)) {
        for (var i = 0; i < node.children.length; i++) {
          offsetIncrement += calcXIndexFor(node.children[i], offset + offsetIncrement);
        }
      }
    }
    else {
      offsetIncrement = node.model.right_index - node.model.left_index;
    }

    correctedRightIndex = node.model.right_index - (offset + offsetIncrement);

    node.xindex = (correctedRightIndex + correctedLeftIndex) / 2;
    maxXindex = Math.max(maxXindex, node.xindex);
    minXindex = Math.min(minXindex, node.xindex);

    return offsetIncrement;
  }

  calcXIndexFor(genetree, 0);
  genetree.maxXindex = maxXindex;
  genetree.minXindex = minXindex;
}

// https://gist.github.com/kueda/1036776#file-d3-phylogram-js-L175
function layoutNodes(genetree, w, h) {
  const MIN_DIST = 0.02;
  var rootDists, xscale, yscale;

  // Visit all nodes depth first and adjust y pos width distance metric
  genetree.walk(function (node) {
    node.root_dist = (node.parent ? node.parent.root_dist : 0) + (Math.max(node.model.distance_to_parent, MIN_DIST) || 0);
  });
  rootDists = genetree.all(expanded).map(function (n) { return n.root_dist; });
  yscale = scale()
    .domain([0, _.max(rootDists)])
    .range([0, w]);

  // Visit nodes depth first and set the unscaled x coord

  xscale = scale()
    .domain([genetree.minXindex, genetree.maxXindex])
    .range([0, h]);

  return genetree.all(expanded).map(function (node) {
    node.x = xscale(node.xindex);
    node.y = yscale(node.root_dist);
    return node;
  });

  function expanded(n) {
    return !n.parent || n.parent.displayInfo.expanded;
  }
}

module.exports = function layoutTree(genetree, geneOfInterest, x, y) {
  addDisplayInfo(genetree, geneOfInterest);
  calculateXIndex(genetree);
  return layoutNodes(genetree, x, y);
};
