var scale = require('d3').scale.linear;

function addDisplayInfo(genetree, geneOfInterest) {
  var paralogPathIds, pathIds;

  pathIds = getPathIds(geneOfInterest);
  paralogPathIds = getParalogPathIds();

  genetree.walk(function (node) {
    var nodeId = node.model.node_id;
    node.displayInfo = {
      expanded: !!pathIds[nodeId],
      expandedBecause: pathIds[nodeId],
      paralogs: paralogPathIds[nodeId]
    };
  });

  function getPathIds(geneOfInterest) {
    var nodesToExpand, repIds;

    // get node_ids of representatives and gene of interest.
    repIds = _.values(geneOfInterest.representative).map(function (rep) { return rep.id; });
    nodesToExpand = _.map(repIds, idToNode);
    nodesToExpand.push(idToNode(geneOfInterest._id));

    // get and index all node_ids in the paths for those nodes.
    // these are the ones that should be expanded by default.
    return _.reduce(nodesToExpand, nodesToPathIds, {});
  }

  function getParalogPathIds(theGene) {
    var paralogIds, paralogNodes;
    paralogIds = _.get(theGene, 'homology.within_species_paralog');
    paralogNodes = _.map(paralogIds, idToNode);
    return _.reduce(paralogNodes, nodesToPathIds, {});
  }

  function idToNode(id) {
    return genetree.indices.gene_stable_id[id];
  }

  function nodesToPathIds(acc, node) {
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
    var nodeName, offsetIncrement, correctedLeftIndex, correctedRightIndex;
    nodeName = node.model.node_taxon ? node.model.node_taxon + ';' + node.model.node_type : node.model.gene_stable_id;
    nodeName += node.displayInfo.expanded ? '*' : '<';
    console.log(_.repeat(' ', node.depth()) + nodeName + ' start : ' + node.model.left_index + '->' + node.model.right_index + '. offset is ' + offset);
    correctedLeftIndex = node.model.left_index - offset;
    if(node.displayInfo.expanded) {
      offsetIncrement = 0;
      if(_.isArray(node.children)) {
        for(var i = 0; i < node.children.length; i++) {
          offsetIncrement += calcXIndexFor(node.children[i], offset + offsetIncrement);
          //offset += ;
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

    console.log(_.repeat(' ', node.depth()) + nodeName + ' end : ' + correctedLeftIndex + '->' + correctedRightIndex + ' gives xindex of ' + node.xindex + '. offset will be incremented by ' + offsetIncrement);

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
