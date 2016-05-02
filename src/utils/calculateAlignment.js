var alignments = {};

function cigarToHistogram(cigar) {
  var blocks = [];
  var positions = [];
  var pieces = cigar.split(/([DM])/);
  var size = 0;
  var stretch = 1;
  pieces.forEach(function(piece) {
    if (piece === "M") {
      blocks.push({
        start: size,
        end: size+stretch
      });
      positions[size] = 1;
      positions[size + stretch] = -1;
      size += stretch;
      stretch = 1;
    }
    else if (piece === "D") {
      size += stretch;
      stretch = 1;
    }
    else if (!!piece) {
      stretch = +piece;
    }
  });
  return {hist: positions, size: size, nSeqs: 1, blocks: blocks};
}

module.exports = function calculateAlignment(node) {
  var nodeId = node.model.node_id;
  if (alignments[nodeId]) return alignments[nodeId];

  if (node.model.cigar) alignments[nodeId] = cigarToHistogram(node.model.cigar);
  else {
    var positions = []; // Thanks for the sparse arrays JavaScript! Merging histograms is easy
    var totalSeqs = 0;
    var size;
    node.children.forEach(function(childNode) { // I know these are binary trees, but this works for k-ary trees
      var childAlignment = calculateAlignment(childNode); // recursive call to be sure that we have an alignment for the childNode
      size = childAlignment.size;
      totalSeqs += childAlignment.nSeqs;
      Object.keys(childAlignment.hist).forEach(function(offset) {
        if (positions[offset]) {
          positions[offset] += childAlignment.hist[offset];
        }
        else {
          positions[offset] = childAlignment.hist[offset];
        }
      });
    });
    alignments[nodeId] = { hist: positions, size: size, nSeqs: totalSeqs };
  }
  return alignments[nodeId];
};
