var _ = require('lodash');
var domains = {};
var calculateAlignment = require('./calculateAlignment').calculateAlignment;


function remap(seqPos, blocks) {
  var posInSeq = 0;
  for(var b=0;b<blocks.length;b++) {
    var block = blocks[b];
    var blockLength = block.end - block.start;
    if (seqPos <= posInSeq + blockLength) {
      return block.start + (seqPos - posInSeq);
    }
    posInSeq += blockLength;
  }
  return 0;
}

function mergeOverlappingDomains(domainList) {
  domainList.sort(function(a,b) {
    return a.start - b.start;
  });
  var merged = [];
  var prev = domainList.shift();
  domainList.forEach(function(d) {
    if (d.start <= prev.end) {
      if (d.id === prev.id) {
        if (d.end > prev.end) {
          prev.end = d.end;
          prev.nSeqs += d.nSeqs;
        }
      }
      else {
        if (d.end > prev.end) {
          d.start = prev.end;
          merged.push(prev);
          prev = d;
        }
        else { // this domain fits inside prev

        }
      }
    }
    else {
      merged.push(prev);
      prev = d;
    }
  });
  merged.push(prev);
  return merged;
}

function getOffsets(positions) {
  return Object.keys(positions).map(function(i) { return +i }).sort(function(a,b){return a - b});
}

function mergeDomains(domainList) {
  // merge domains with the same id first
  // then merge with other domains
  var domainHist = {}; // key is domain id
  domainList.forEach(function(d) {
    if (!domainHist.hasOwnProperty(d.id)) {
      domainHist[d.id] = _.clone(d); // representative
      domainHist[d.id].hist = {};
    }
    var hist = domainHist[d.id].hist;
    if (hist[d.start])
      hist[d.start] += d.nSeqs;
    else
      hist[d.start] = d.nSeqs;
    if (hist[d.end])
      hist[d.end] -= d.nSeqs;
    else
      hist[d.end] = -d.nSeqs;
  });
  var merged = [];
  _.each(domainHist, function(domain) {
    var offsets = getOffsets(domain.hist);
    var depth = 0;
    for(var i=0; i<offsets.length - 1; i++) {
      depth += domain.hist[offsets[i]];
      if (depth > 0) {
        var d = _.clone(domain);
        d.start = offsets[i];
        d.end = offsets[i+1];
        d.nSeqs = depth;
        delete d.hist;
        merged.push(d)
      }
    }
  });
  return merged;
}

module.exports = function positionDomains(node,reset) {
  if (reset) {
    domains = {};
  }
  var nodeId = node.model.node_id;
  if (domains[nodeId]) return domains[nodeId];

  if (node.model.cigar) {
    var alignment = calculateAlignment(node);
    if (node.model.domains) {
      // map start and end positions in domains to positions in cigar space
      var domainsList = node.model.domains.map(function(d) {
        return {
          start: remap(d.start-1, alignment.blocks),
          end: remap(d.end, alignment.blocks),
          root: d.root,
          id: d.id,
          name: d.name,
          description: d.description,
          nSeqs: 1
        }
      });
      domains[nodeId] = domainsList
    }
    else {
      // no domains on this gene, return an empty list
      domains[nodeId] = [];
    }
  }
  else if (node.children.length === 1) {
    domains[nodeId] = positionDomains(node.children[0]);
  }
  else {
    var domainList = [];
    node.children.forEach(function(childNode) {
      var childDomains = positionDomains(childNode);
      childDomains.forEach(function(cd) {
        domainList.push(cd);
      });
    });
    // if we have domains, merge them
    if (domainList.length > 1) {
      domainList = mergeDomains(domainList);
    }
    domains[nodeId] = domainList;
  }
  return domains[nodeId];
};
