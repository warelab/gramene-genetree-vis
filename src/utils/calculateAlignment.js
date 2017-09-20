var _ = require('lodash');

var alignments = {};

function calculateAlignmentFromConsensus(node) {
  var nodeId = node.model.node_id;
  if (alignments[nodeId]) return alignments[nodeId];
  // these blocks are likely to be smaller and more numerous
  let consensus = node.model.consensus;
  let deltaDepth = {};
  // find first non-zero frequency
  let i=0;
  while (consensus.frequency[i] === 0) i++;
  deltaDepth[i] = consensus.frequency[i];
  let blocks = [];
  let block = {
    start: i,
    end: consensus.consensusLength
  };
  for(let j=i+1; j<consensus.consensusLength; j++) {
    if (consensus.frequency[j] !== consensus.frequency[i]) {
      deltaDepth[j] = consensus.frequency[j] - consensus.frequency[i];
      if (consensus.frequency[i] === 0) {
        block.start = j;
      }
      if (consensus.frequency[j] === 0) {
        block.end = j;
        blocks.push(_.cloneDeep(block));
      }
      i=j;
    }
  }
  if (consensus.frequency[i]) {
    deltaDepth[consensus.consensusLength] = 0 - consensus.frequency[i];
    block.end = consensus.consensusLength;
    blocks.push(_.cloneDeep(block));
  }
  alignments[nodeId] = {
    hist: deltaDepth,
    blocks: blocks,//rebuildBlocksFromAlignment(deltaDepth),
    size: consensus.consensusLength,
    nSeqs: consensus.nSeqs
  };
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

function mergeAdjacent(domainList) {
  let merged=[];
  let last = domainList.shift();
  domainList.forEach(function (d) {
    if (last.id === d.id && last.end === d.start) {
      last.end = d.end;
    }
    else {
      merged.push(last);
      last = d;
    }
  });
  merged.push(last);
  return merged;
}

function resolveOverlaps(dl) {
  if (dl.length < 2)
    return dl;
  let domainList = _.cloneDeep(dl);
  domainList.sort(function(a,b) {
    return a.start - b.start;
  });
  let trimmed = [];
  let last = _.clone(domainList[0]);
  let i = 1;
  while (i < domainList.length) {
    var d = domainList[i];
    if (d.start >= last.end) {
      trimmed.push(last);
      last = d;
      i++;
    }
    else {
      // trim last up to d.start
      if (last.start < d.start) {
        let l = _.clone(last);
        l.end = d.start;
        trimmed.push(l);
        last.start = d.start;
      }
      if (d.nSeqs > last.nSeqs) {
        if (d.end >= last.end) {
          last = d;
          i++;
        }
        else {
          // d ends inside of last but d is better
          // need to trim last and insert it into domainList
          // where it goes to preserve sorted order
          let l = _.clone(last);
          l.start = d.end;
          last = _.clone(d);
          let j = i+1;
          while (j < domainList.length && domainList[j].start < l.start) {
            domainList[j-1] = domainList[j];
            j++;
          }
          domainList[j-1] = l;
        }
      }
      else { // last.nSeqs >= d.nSeqs
        if (last.end >= d.end) { // skip d
          i++;
        }
        else {
          let l = _.clone(d);
          l.start = last.end;
          let j = i+1;
          while (j < domainList.length && domainList[j].start < l.start) {
            domainList[j-1] = domainList[j];
            j++;
          }
          domainList[j-1] = l;
        }
      }
    }
  }
  trimmed.push(last);
  return mergeAdjacent(trimmed);
}

module.exports = {
  calculateAlignment: calculateAlignmentFromConsensus,
  findGaps: findGaps,
  removeGaps: removeGaps,
  getOffsets: getOffsets,
  resolveOverlaps: resolveOverlaps,
  clean: function() {
    alignments = {};
  }
};

