var _ = require('lodash');
var scale = require('d3').scale.linear;
var calculateIdentity = require('gramene-trees-client').extensions.identity;

function relateNodesToGeneOfInterest(genetree, geneOfInterest, taxonomy) {
  // pivot tree branches to put geneOfInterest first
  let node = genetree.indices.gene_stable_id[geneOfInterest._id];
  while (!node.isRoot()) {
    const parent = node.parent;
    const children = parent.children;
    const nodeIdx = _.findIndex(children, (n) => n === node);

    // move this node to the front of the children array.
    if (nodeIdx) {
      children.splice(0, 0, children.splice(nodeIdx, 1)[0]);
    }
    node = parent;
  }
  // (re)initialize relationships
  genetree.walk(function (node) {
    node.relationToGeneOfInterest = {};
  });
  addHomologyInformationToNodes(genetree, geneOfInterest);
  addTaxonDistanceInformationToNodes(genetree, geneOfInterest, taxonomy);
}

function addHomologyInformationToNodes(genetree, theGene) {
  var homologs, representatives;
  if (theGene) {
    var theGeneNode = genetree.indices.gene_stable_id[theGene._id];
    homologs = indexHomologs(theGene);
    representatives = indexReps(theGene);
    genetree.walk(function (node) {
      var nodeId, homology;
      nodeId = node.model.gene_stable_id;
      if (nodeId) {
        if (nodeId === theGene._id) {
          homology = 'self';
        }
        else {
          homology = homologs[nodeId];
        }
        node.relationToGeneOfInterest.identity = calculateIdentity(theGeneNode, node);
        node.relationToGeneOfInterest.homology = homology;
        node.relationToGeneOfInterest.repType = representatives[nodeId];
      }
    });
  }
}

// IN -> key: homologyType, value: [geneId]
// OUT-> key: geneId, value: homologyType
function indexHomologs(theGene) {
  var homologs = _.get(theGene, 'homology.homologous_genes');
  return _.transform(homologs, function (result, value, key) {
    _.forEach(value, function (id) {
      result[id] = key;
    });
    return result;
  }, {});
}

// IN -> key: representativeType, value: gene doc
// OUT-> key: geneId, value: representativeType
function indexReps(theGene) {
  var representative = _.get(theGene, 'homology.gene_tree.representative');
  return _.transform(representative, function (result, rep, repType) {
    result[rep.id] = repType;
    return result;
  }, {});
}

function addTaxonDistanceInformationToNodes(genetree, geneOfInterest, taxonomy) {
  /*const*/ var OUTGROUP_FLAG = -1;
  var theGeneTaxonId, theTaxonNode, theTaxonPath,
    theTaxonPathIds, relationLUT, distances, maxima;

  theGeneTaxonId = geneOfInterest.taxon_id;

  if (theGeneTaxonId && taxonomy) {
    theTaxonNode = taxonomy.indices.id[theGeneTaxonId];
    theTaxonPath = theTaxonNode.getPath();
    theTaxonPathIds = _.keyBy(theTaxonPath, 'model.id');
    relationLUT = {};
    maxima = {
      lcaDistance: 0,
      pathDistance: 0
    };

    genetree.walk(function (node) {
      var nodeTaxonId, nodeTaxon, pathDistance, lcaDistance, lca;
      nodeTaxonId = node.model.taxon_id || node.model.node_taxon_id;

      // have we already seen this?
      if (relationLUT[nodeTaxonId]) {
        node.relationToGeneOfInterest.taxonomy = relationLUT[nodeTaxonId];
      }
      else {
        if (nodeTaxonId === theGeneTaxonId) {
          lcaDistance = 0;
          pathDistance = 0;
        }
        else {
          if ((lca = theTaxonPathIds[nodeTaxonId])) {
            pathDistance = 0;
          }
          else {
            nodeTaxon = taxonomy.indices.id[nodeTaxonId];
            if(nodeTaxon) {
              lca = theTaxonNode.lcaWith([nodeTaxon]);
              pathDistance = lca.pathTo(nodeTaxon).length - 1;
            }
            else {
              pathDistance = OUTGROUP_FLAG;
            }
          }

          if(pathDistance === OUTGROUP_FLAG) {
            lcaDistance = OUTGROUP_FLAG;
          }
          else {
            lcaDistance = theTaxonPath.length - _.indexOf(theTaxonPath, lca) - 1;
          }
        }

        distances = {
          lcaDistance: lcaDistance,
          pathDistance: pathDistance,
          maxima: maxima
        };

        maxima.lcaDistance = Math.max(maxima.lcaDistance, distances.lcaDistance);
        maxima.pathDistance = Math.max(maxima.pathDistance, distances.pathDistance);

        relationLUT[nodeTaxonId] = node.relationToGeneOfInterest.taxonomy = distances;
      }
    });

    // any taxa we don't have in the taxonomy tree, we will set to the max values seen.
    // it's ok to modify values in the LUT because these point to the same refs as the nodes.
    _.forIn(relationLUT, function updateOutgroupTaxa(distances) {
      if(distances.lcaDistance === OUTGROUP_FLAG) {
        distances.lcaDistance = maxima.lcaDistance;
        distances.pathDistance = maxima.pathDistance;
      }
    });

    maxima.colorScale = scale()
      .domain([0, maxima.lcaDistance + maxima.pathDistance])
      .range(['green', 'red']);
  }
}

module.exports = relateNodesToGeneOfInterest;
