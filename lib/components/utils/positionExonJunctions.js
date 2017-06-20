'use strict';

var WIGGLE_ROOM = 0;
var exonJunctions = {};

var calculateAlignment = require('./calculateAlignment').calculateAlignment;

function remap(seqPos, bins) {
  var posInSeq = 0;
  for (var b = 0; b < bins.length; b++) {
    var bin = bins[b];
    var binLength = bin.end - bin.start;
    if (seqPos <= posInSeq + binLength) {
      return bin.start + (seqPos - posInSeq);
    }
    posInSeq += binLength;
  }
  return 0;
}

module.exports = function positionExonJunctions(node) {
  var nodeId = node.model.node_id;
  if (exonJunctions[nodeId]) return exonJunctions[nodeId];

  if (node.model.cigar) {
    var alignment = calculateAlignment(node);
    if (node.model.exon_junctions) {
      exonJunctions[nodeId] = {
        list: node.model.exon_junctions.map(function (ej) {
          return remap(ej, alignment.hist);
        }),
        size: alignment.size
      };
    } else {
      // no domains on this gene, return an empty list
      exonJunctions[nodeId] = { list: [], size: alignment.size };
    }
  } else {
    var size;
    var ejList = [];
    node.children.forEach(function (childNode) {
      var childEjs = positionExonJunctions(childNode);
      size = size || childEjs.size;
      childEjs.list.forEach(function (cej) {
        var found = false;
        for (var i = 0; i < ejList.length && !found; i++) {
          var pej = ejList[i];
          if (Math.abs(pej - cej) < WIGGLE_ROOM) {
            found = true;
          }
        }
        if (!found) {
          ejList.push(cej);
        }
      });
    });
    // exonJunctions[nodeId] = { list: ejList, size: size };
    exonJunctions[nodeId] = { list: [], size: size };
  }
  return exonJunctions[nodeId];
};