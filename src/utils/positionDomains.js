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
            }
          }
          else {
            if (d.end > prev.end) {
              d.start = prev.end;
              merged.push(prev);
              prev = d;
            }
          }
        }
        else {
          merged.push(prev);
          prev = d;
        }
      });
      merged.push(prev);
      domainList = merged;
    }
    domains[nodeId] = domainList;
  }
  return domains[nodeId];
};
