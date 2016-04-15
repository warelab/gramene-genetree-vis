function cigarToHistogram(cigar) {
  var histogram = [];
  var pieces = cigar.split(/([DM])/);
  var size = 0;
  for(var i=0;i<pieces.length;i+=2) {
    var stretch = +pieces[i];
    var isMatch = (pieces[i+1] === "M");
    if (isMatch) {
      histogram.push({
        start: size + 1,
        end: size + stretch,
        score: 1
      });
    }
    size += stretch;
  }
  return {hist: histogram, size: size, nSeqs: 1};
}

module.exports = function calculateAlignment(node) {
  if (node.alignment) return;
  if (node.model.alignment) node.alignment = node.model.alignment; // future proof if this gets calculated at build time instead
  else if (node.model.cigar) node.alignment = cigarToHistogram(node.model.cigar);
  else {
    var positions = []; // Thanks for the sparse arrays JavaScript! Merging histograms is easy
    var totalSeqs = 0;
    node.children.forEach(function(childNode) { // I know these are binary trees, but this works for k-ary trees
      calculateAlignment(childNode); // recursive call to be sure that we have an alignment for the childNode
      totalSeqs += childNode.alignment.nSeqs;
      childNode.alignment.hist.forEach(function(region) {
        function updatePosition(positions, offset, value) {
          if (!positions[offset]) positions[offset] = value;
          else                    positions[offset] += value;
        }
        updatePosition(positions, region.start, region.score);
        updatePosition(positions, region.end, -region.score);
      });
    });
    node.alignment = { hist: [], size: node.children[0].alignment.size, nSeqs: totalSeqs };
    var depth = 0;
    var offsets = Object.keys(positions); // Here is the magical part. Is this guaranteed to be sorted properly?
    for (var i = 0; i<offsets.length - 1; i++) {
      var p = +offsets[i];
      depth += positions[p];
      if (depth > 0) {
        node.alignment.hist.push({
          start: +offsets[i],
          end: +offsets[i+1],
          score: depth
        });
      }
    }
  }
};
