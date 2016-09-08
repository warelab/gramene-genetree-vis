var scale = require('d3').scale.linear;
var _ = require('lodash');

var calculateSvgHeight = require('./calculateSvgHeight');

function calculateXIndex(genetree) {
  var visibleUnexpanded = []; // array of unexpanded nodes that are visible

  function calcXIndexFor(node) {
    var leftExtrema, rightExtrema;
    if (node.displayInfo.expanded && node.children.length > 0) {

      if (node.children.length === 2) {
        leftExtrema = calcXIndexFor(node.children[0]); // left child
        rightExtrema = calcXIndexFor(node.children[1]); // right child
        node.xindex = (rightExtrema.min + leftExtrema.max) / 2; // midpoint
        return {
          min: leftExtrema.min,
          max: rightExtrema.max
        };
      }
      else {
        var childExtrema = calcXIndexFor(node.children[0]);
        node.xindex = node.children[0].xindex;
        return {
          min: childExtrema.min,
          max: childExtrema.max
        };
      }
    }
    else {
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


// https://gist.github.com/kueda/1036776#file-d3-phylogram-js-L175
function layoutNodes(genetree, w) {
  const MIN_DIST = 0.05;
  var rootDists, xscale, yscale, h;

  h = calculateSvgHeight(genetree);

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

module.exports = function layoutTree(genetree, x) {
  calculateXIndex(genetree);
  return layoutNodes(genetree, x);
};
