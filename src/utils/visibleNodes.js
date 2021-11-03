import _ from 'lodash';

export function makeNodeVisible(node) {
  node.displayInfo.expanded = true;
}

export function makeNodeInvisible(node) {
  node.displayInfo.expanded = false;
}

export function makeCladeVisible(node) {
  node.walk(makeNodeVisible);
}

export function makeCladeInvisible(node) {
  node.walk(makeNodeInvisible);
}
function compressLongTaxonName(node) {
  const fullName = node.model.taxon_name;
  const removedExtraineousWords = fullName.replace(/( Group$| subsp\.| ssp\.| var\.| strain)/, '');
  let finalVersion;
  if (removedExtraineousWords.length > 20) {
    let words = removedExtraineousWords.split(' ');
    if (words.length === 2) {
      // abrreviate first word.
      finalVersion = removedExtraineousWords.replace(/^([A-Z])[a-z]+/, '$1.')
    }
    if (words.length > 2) {
      finalVersion = removedExtraineousWords.replace(/^([A-Z])[a-z]+\s([a-z])[a-z]+/, '$1$2.')
    }
  }
  else {
    finalVersion = removedExtraineousWords;
  }
  node.model.taxon_name = finalVersion;
}
export function compressLongTaxonNames(node) {
  node.walk(compressLongTaxonName);
}
export function calculateXIndex(genetree) {
  let visibleUnexpanded = []; // array of unexpanded nodes that are visible

  function calcXIndexFor(node) {
    if (node.displayInfo.expanded && node.children.length > 0) {

      if (node.children.length === 2) {
        let leftExtrema = calcXIndexFor(node.children[0]); // left child
        let rightExtrema = calcXIndexFor(node.children[1]); // right child
        node.xindex = (rightExtrema.min + leftExtrema.max) / 2; // midpoint
        return {
          min: leftExtrema.min,
          max: rightExtrema.max
        };
      }
      else {
        let childExtrema = calcXIndexFor(node.children[0]);
        node.xindex = node.children[0].xindex;
        return {
          min: childExtrema.min,
          max: childExtrema.max
        };
      }
    }
    else {
      visibleUnexpanded.push(node);
      node.xindex = visibleUnexpanded.length;
      return {
        min: node.xindex,
        max: node.xindex
      };
    }
  }

  let treeExtrema = calcXIndexFor(genetree);
  genetree.maxXindex = treeExtrema.max;
  genetree.minXindex = treeExtrema.min;
}

export function setDefaultNodeDisplayInfo(genetree, geneOfInterest, expandRepresentatives) {
  let pathIds = getPathIds(expandRepresentatives);
  let paralogPathIds = getParalogPathIds();
  let orthologPathIds = null; //getOrthologPathIds();

  genetree.walk(function (node) {
    let nodeId = node.model.node_id;
    let isLeafNode = !!node.model.gene_stable_id;
    let onlyChild = (node.children && node.children.length === 1);
    let displayInfo = {
      expanded: false,
      leafNode: isLeafNode,
      isGeneOfInterest: (node.model.gene_stable_id === geneOfInterest._id)
    };
    if (!!pathIds[nodeId]) {
      displayInfo.expanded = true;
      displayInfo.expandedBecause = pathIds[nodeId];
    }
    else if (node.parent) {
      let parentNodeId = node.parent.model.node_id;

      if ((isLeafNode || onlyChild) && pathIds[parentNodeId]) {
        displayInfo.expanded = true;
        displayInfo.expandedBecause = pathIds[parentNodeId];
        pathIds[node.model.node_id] = [node];
      }
    }

    displayInfo.paralogs = paralogPathIds ? paralogPathIds[nodeId] : [];
    displayInfo.orthologs = orthologPathIds ? orthologPathIds[nodeId] : [];

    node.displayInfo = displayInfo;
  });

  function getPathIds(expandRepresentatives) {
    let representatives = expandRepresentatives && _.get(geneOfInterest.homology.gene_tree, 'representative');

    // get nodes of representatives and gene of interest.
    let nodesToExpand = representatives ? _.map(representatives, (rep)=>idToNode(rep.id)) : [];
    nodesToExpand.push(idToNode(geneOfInterest._id));

    // get and index all node_ids in the paths for those nodes.
    // these are the ones that should be expanded by default.
    return _.reduce(nodesToExpand, nodesToPathIds, {});
  }

  function pathIdsImpl(path) {
    let ids = _.get(geneOfInterest, path);
    if (!ids) {
      return null;
    }
    ids.push(geneOfInterest._id);
    let nodes = _.map(ids, idToNode);
    return _.reduce(nodes, nodesToPathIds, {});
  }

  function getParalogPathIds() {
    return pathIdsImpl('homology.homologous_genes.within_species_paralog');
  }

  function getOrthologPathIds() {
    let keys = _.keys(_.get(geneOfInterest, 'homology.homologous_genes')).map(function (key) {
      return 'homology.homologous_genes.' + key;
    });
    let filteredKeys = _.filter(keys, function (key) { return key.indexOf('ortholog') > -1; });
    let pathIdsArray = _.map(filteredKeys, pathIdsImpl);
    return _.reduce(pathIdsArray, function (acc, obj) {
      return _.mergeWith(acc, obj, function mergeIndexedPathIds(accVal, objVal) {
        return _.isArray(accVal) ? accVal.concat(objVal) : objVal;
      });
    });
  }

  function idToNode(id) {
    return genetree.indices.gene_stable_id[id];
  }

  function nodesToPathIds(acc, node) {
    // take an array of nodes, return an object with
    // key: pathNodeId
    // value: array of actual nodes (not the ones in the path).
    if(!node) return acc;

    let paralogPairs = _.map(node.getPath(), function (n) {
      return [n.model.node_id, node];
    });
    let paralogLUT = _.fromPairs(paralogPairs);

    return _.assignWith(acc, paralogLUT, function (accVal, srcVal) {
      return _.isUndefined(accVal) ? [srcVal] : _.concat(accVal, srcVal);
    });
  }
}
