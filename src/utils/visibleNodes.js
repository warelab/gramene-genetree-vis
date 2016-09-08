import _ from 'lodash';

export function makeNodeVisible(node) {
  node.displayInfo.expanded = true;
}

export function makeCladeVisible(node) {
  node.walk(makeNodeVisible);
}

export function makeCladeInvisible(node) {
  node.displayInfo.expanded = false;
}

export function setDefaultNodeDisplayInfo(genetree, geneOfInterest) {
  var paralogPathIds, orthologPathIds, pathIds;

  pathIds = getPathIds();
  paralogPathIds = getParalogPathIds();
  orthologPathIds = getOrthologPathIds();

  genetree.walk(function (node) {
    var nodeId, isLeafNode, parentNodeId, displayInfo;
    nodeId = node.model.node_id;
    isLeafNode = !!node.model.gene_stable_id;
    displayInfo = {
      expanded: false,
      leafNode: isLeafNode
    };

    if (!!pathIds[nodeId]) {
      displayInfo.expanded = true;
      displayInfo.expandedBecause = pathIds[nodeId];
    }
    // else if(!!additionalVisibleIds[nodeId]) {
    //   if (node.parent.displayInfo.expanded) {
    //     displayInfo.expanded = true;
    //     displayInfo.expandedBecause = 'selected';
    //   }
    // }
    else {
      parentNodeId = node.parent.model.node_id;

      if (isLeafNode && pathIds[parentNodeId]) {
        displayInfo.expanded = true;
        displayInfo.expandedBecause = pathIds[parentNodeId];
      }
    }

    displayInfo.paralogs = paralogPathIds ? paralogPathIds[nodeId] : [];
    displayInfo.orthologs = orthologPathIds ? orthologPathIds[nodeId] : [];

    node.displayInfo = displayInfo;
  });

  function getPathIds() {
    var representatives, nodesToExpand;

    representatives = _.get(geneOfInterest.homology.gene_tree, 'representative');

    // get nodes of representatives and gene of interest.
    nodesToExpand = representatives ? _.map(representatives, (rep)=>idToNode(rep.id)) : [];
    nodesToExpand.push(idToNode(geneOfInterest._id));

    // get and index all node_ids in the paths for those nodes.
    // these are the ones that should be expanded by default.
    return _.reduce(nodesToExpand, nodesToPathIds, {});
  }

  function pathIdsImpl(path) {
    var ids, nodes;
    ids = _.get(geneOfInterest, path);
    nodes = _.map(ids, idToNode);
    return _.reduce(nodes, nodesToPathIds, {});
  }

  function getParalogPathIds() {
    return pathIdsImpl('homology.homologous_genes.within_species_paralog');
  }

  function getOrthologPathIds() {
    var keys, filteredKeys, pathIdsArray, result;
    keys = _.keys(_.get(geneOfInterest, 'homology.homologous_genes')).map(function (key) {
      return 'homology.homologous_genes.' + key;
    });
    filteredKeys = _.filter(keys, function (key) { return key.indexOf('ortholog') > -1; });
    pathIdsArray = _.map(filteredKeys, pathIdsImpl);
    result = _.reduce(pathIdsArray, function (acc, obj) {
      return _.mergeWith(acc, obj, function mergeIndexedPathIds(accVal, objVal) {
        return _.isArray(accVal) ? accVal.concat(objVal) : objVal;
      });
    });
    return result;
  }

  function idToNode(id) {
    return genetree.indices.gene_stable_id[id];
  }

  function nodesToPathIds(acc, node) {
    // take an array of nodes, return an object with
    // key: pathNodeId
    // value: array of actual nodes (not the ones in the path).
    if(!node) return acc;

    var paralogPairs, paralogLUT;
    paralogPairs = _.map(node.getPath(), function (n) {
      return [n.model.node_id, node];
    });
    paralogLUT = _.fromPairs(paralogPairs);

    return _.assignWith(acc, paralogLUT, function (accVal, srcVal) {
      return _.isUndefined(accVal) ? [srcVal] : _.concat(accVal, srcVal);
    });
  }
}
