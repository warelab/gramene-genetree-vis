var alignments = {};

function cigarToHistogram(cigar) {
  var histogram = [];
  var pieces = cigar.split(/([DM])/);
  var size = 0;
  var stretch = 1;
  pieces.forEach(function(piece) {
    if (piece === "M") {
      histogram.push({
        start: size,
        end: size + stretch,
        score: 1
      });
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
  return {hist: histogram, size: size, nSeqs: 1};
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
      childAlignment.hist.forEach(function(region) {
        function updatePosition(positions, offset, value) {
          if (!positions[offset]) positions[offset] = value;
          else                    positions[offset] += value;
        }
        updatePosition(positions, region.start, region.score);
        updatePosition(positions, region.end, -region.score);
      });
    });
    var histogram = [];
    alignments[nodeId] = { hist: histogram, size: size, nSeqs: totalSeqs };
    var depth = 0;
    var offsets = Object.keys(positions).map(function(i) { return +i }).sort(function(a,b){return a - b});
    for (var i = 0; i<offsets.length - 1; i++) {
      depth += positions[offsets[i]];
      if (depth > 0) {
        histogram.push({
          start: offsets[i],
          end: offsets[i+1],
          score: depth
        });
      }
    }
  }
  return alignments[nodeId];
};
