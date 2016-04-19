const WIGGLE_ROOM = 10;
var domains = {};
var calculateAlignment = require('./calculateAlignment');

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
  if (domains[nodeId]) return domains[nodeId];

  if (node.model.cigar) {
    var alignment = calculateAlignment(node);
    if (node.model.domains) {
      // map start and end positions in domains to positions in cigar space
      var domainsList = node.model.domains.map(function(d) {
        return {
          start: remap(d.start, alignment.hist),
          end: remap(d.end, alignment.hist),
          root: d.root,
          name: d.name,
          description: d.description,
          nSeqs: 1
        }
      });
      domains[nodeId] = {list: domainsList, size: alignment.size}
    }
    else {
      // no domains on this gene, return an empty list
      domains[nodeId] = {list: [], size: alignment.size};
    }
  }
  else {
    var size;
    var domainList = [];
    node.children.forEach(function(childNode) {
      var childDomains = positionDomains(childNode);
      size = size || childDomains.size;
      childDomains.list.forEach(function(cd) {
        var found=false;
        for(var i=0;i<domainList.length && !found;i++) {
          var pd = domainList[i];
          if (pd.root === cd.root
            && Math.abs(pd.start - cd.start) < WIGGLE_ROOM
            && Math.abs(pd.end - cd.end) < WIGGLE_ROOM) {
            if (cd.start < pd.start) pd.start = cd.start;
            if (cd.end > pd.end) pd.end = cd.end;
            pd.nSeqs += cd.nSeqs;
            found=true;
          }
        }
        if (!found) {
          domainList.push(cd);
        }
      });
    });
    domains[nodeId] = { list: domainList, size: size };
  }
  return domains[nodeId];
};
