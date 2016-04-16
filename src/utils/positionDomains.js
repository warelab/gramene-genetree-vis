var alignments = {};

function cigarToHistogram(cigar) {
  var histogram = [];
  var pieces = cigar.split(/([DM])/);
  var size = 0;
  var stretch = 1;
  pieces.forEach(function(piece) {
    if (piece === "M") {
      histogram.push({
        start: size + 1,
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

function remap(seqPos,bins) {
  var posInSeq = 0;
  for(var b=0;b<bins.length;b++) {
    var bin = bins[b];
    var binLength = bin.end - bin.start + 1;
    if (seqPos <= posInSeq + binLength) {
      return bin.start + (seqPos - posInSeq);
    }
    posInSeq += binLength;
  }
  return 0;
}

module.exports = function positionDomains(node) {
  var nodeId = node.model.node_id;
  if (alignments[nodeId]) return alignments[nodeId];

  if (node.model.cigar) {
    var cigarHist = cigarToHistogram(node.model.cigar);
    if (node.model.domains) {
      // map start and end positions in domains to positions in cigar space
      var domainsHist = node.model.domains.map(function(d) {
        return {
          start: remap(d.start, cigarHist.hist),
          end: remap(d.end, cigarHist.hist),
          score: 1
        }
      });
      alignments[nodeId] = {hist: domainsHist, size: cigarHist.size, nSeqs: 1}
    }
    else {
      // no domains on this gene, return an empty histogram
      alignments[nodeId] = {hist: [], size: cigarHist.size, nSeqs: 0};
    }
  }
  else {
    var positions = []; // Thanks for the sparse arrays JavaScript! Merging histograms is easy
    var totalSeqs = 0;
    var size;
    node.children.forEach(function(childNode) { // I know these are binary trees, but this works for k-ary trees
      var childAlignment = positionDomains(childNode); // recursive call to be sure that we have an alignment for the childNode
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
