var alignments = {};

function cigarToHistogram(cigar) {
  var blocks = [];
  var positions = {};
  var pieces = cigar.split(/([DM])/);
  var size = 0;
  var stretch = 0;
  pieces.forEach(function(piece) {
    if (piece === "M") {
      if (stretch === 0) stretch = 1;
      blocks.push({
        start: size,
        end: size+stretch
      });
      positions[size] = 1;
      positions[size + stretch] = -1;
      size += stretch;
      stretch = 0;
    }
    else if (piece === "D") {
      if (stretch === 0) stretch = 1;
      size += stretch;
      stretch = 0;
    }
    else if (!!piece) {
      stretch = +piece;
    }
  });
  return {hist: positions, size: size, nSeqs: 1, blocks: blocks};
}

function calculateAlignment(node) {
  var nodeId = node.model.node_id;
  if (alignments[nodeId]) return alignments[nodeId];

  if (node.model.cigar) alignments[nodeId] = cigarToHistogram(node.model.cigar);
  else if (node.children.length === 1) { // this happens when one child has no genomes of interest
    alignments[nodeId] = _.cloneDeep(calculateAlignment(node.children[0]));
  }
  else {
    var positions = {}; // Thanks for the sparse arrays JavaScript! Merging histograms is easy
    var totalSeqs = 0;
    var size;
    node.children.forEach(function(childNode) { // I know these are binary trees, but this works for k-ary trees
      var childAlignment = calculateAlignment(childNode); // recursive call to be sure that we have an alignment for the childNode
      size = childAlignment.size;
      totalSeqs += childAlignment.nSeqs;
      Object.keys(childAlignment.hist).forEach(function(offset) {
        if (positions[offset]) {
          positions[offset] += childAlignment.hist[offset];
          if (positions[offset] === 0) {
            delete positions[offset];
          }
        }
        else {
          positions[offset] = childAlignment.hist[offset];
        }
      });
    });
    alignments[nodeId] = { hist: positions, size: size, nSeqs: totalSeqs };
  }
  return alignments[nodeId];
}

function getOffsets(positions) {
  return Object.keys(positions).map(function(i) { return +i }).sort(function(a,b){return a - b});
}

function findGaps(alignment) {
  var positions = alignment.hist;
  var offsets = getOffsets(positions);
  var depth = 0;
  var gaps = [];
  var prevEnd = 0;
  for(var i=0; i<offsets.length; i++) {
    if (depth === 0 && prevEnd < offsets[i]) {
      gaps.push({start: prevEnd, end: offsets[i]});
    }
    depth += positions[offsets[i]];
    prevEnd = offsets[i];
  }
  if (prevEnd < alignment.size) {
    gaps.push({start: prevEnd, end: alignment.size});
  }
  return gaps;
}

function removeGapsFromAlignment(gaps, positions) {
  var collapsedSoFar = 0;
  var offsets = getOffsets(positions);
  var newPositions = {};
  var g=0;
  offsets.forEach(function(offset) {
    while (g < gaps.length && offset > gaps[g].start) {
      collapsedSoFar += gaps[g].end - gaps[g].start;
      g++;
    }
    var newOffset = offset - collapsedSoFar;
    if (newPositions[newOffset]) {
      newPositions[newOffset] += positions[offset];
      if (newPositions[newOffset] === 0) {
        delete newPositions[newOffset];
      }
    }
    else {
      newPositions[newOffset] = positions[offset];
    }
  });
  return newPositions;
}

function rebuildBlocksFromAlignment(positions) {
  var offsets = getOffsets(positions);
  var blocks = [];
  var depth = 0;
  for(var i=0; i<offsets.length - 1; i++) {
    depth += positions[offsets[i]];
    if (depth > 0) {
      blocks.push({
        start: offsets[i],
        end: offsets[i+1]
      });
    }
  }
  return blocks;
}

function removeGaps(gaps, tree) {
  var size = alignments[tree.model.node_id].size;
  gaps.forEach(function(g) {
    size -= g.end - g.start;
  });
  tree.walk(function(node) {
    var nodeId = node.model.node_id;
    alignments[nodeId].size = size;
    alignments[nodeId].hist = removeGapsFromAlignment(gaps, alignments[nodeId].hist);
    if (!node.hasChildren()) {
      alignments[nodeId].blocks = rebuildBlocksFromAlignment(alignments[nodeId].hist);
    }
  });
}

module.exports = {
  calculateAlignment: calculateAlignment,
  findGaps: findGaps,
  removeGaps: removeGaps,
  getOffsets: getOffsets,
  clean: function() {
    alignments = {};
  }
};

