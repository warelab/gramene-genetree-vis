//var _ = require('lodash');
//
//function highlightClade(genetree, highlightNode, type) {
//  var highlightNodeId, highlightNodePathIds;
//  highlightNodeId = highlightNode.model.node_id;
//  highlightNodePathIds = _.keyBy(highlightNode.getPath(), 'model.node_id');
//  delete highlightNodePathIds[highlightNodeId];
//
//  genetree.filterWalk(function(node) {
//    var nodeId, isInIngroup;
//    nodeId = node.model.node_id;
//
//    if( highlightNodePathIds[nodeId] ) {
//      isInIngroup = false;
//    }
//  });
//}
//
//module.exports = highlightClade;