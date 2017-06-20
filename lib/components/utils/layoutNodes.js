'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = layoutNodes;
var scale = require('d3').scale.linear;

// https://gist.github.com/kueda/1036776#file-d3-phylogram-js-L175
function layoutNodes(genetree, w, h) {
  var MIN_DIST = 0.05;
  var MAX_DIST = 2;

  var xscale = scale().domain([genetree.minXindex, genetree.maxXindex]).range([0, h]);

  var maxExpandedDist = 0;
  var expandedNodes = [];
  genetree.walk(function (node) {
    var parentDist = Math.max(node.model.distance_to_parent, MIN_DIST) || 0;
    while (parentDist > MAX_DIST) {
      parentDist /= 10;
    }
    node.root_dist = (node.parent ? node.parent.root_dist : 0) + parentDist;
    if (!node.parent || node.parent.displayInfo.expanded) {
      node.x = xscale(node.xindex);
      expandedNodes.push(node);
      if (node.root_dist > maxExpandedDist) {
        maxExpandedDist = node.root_dist;
      }
    }
  });
  var yscale = scale().domain([0, maxExpandedDist]).range([0, w]);

  return expandedNodes.map(function (node) {
    node.y = yscale(node.root_dist);
    return node;
  });
}