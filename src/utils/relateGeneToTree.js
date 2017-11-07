import _ from 'lodash';
let scale = require('d3').scale.linear;
let calculateIdentity = require('gramene-trees-client').extensions.identity;

function relateNodesToGeneOfInterest(genetree, geneOfInterest, taxonomy, pivotTree) {
  addHomologyInformationToNodes(genetree, geneOfInterest);
  addTaxonDistanceInformationToNodes(genetree, geneOfInterest, taxonomy);
  if (pivotTree) {
    let node = genetree.indices.gene_stable_id[geneOfInterest._id];

    const indexCallback = (n) => n === node;

    while (!node.isRoot()) {
      const parent = node.parent;
      const children = parent.children;
      const nodeIdx = _.findIndex(children, indexCallback);

      // move this node to the front of the children array.
      if (nodeIdx) {
        children.splice(0, 0, children.splice(nodeIdx, 1)[0]);
      }
      node = parent;
    }
  }
}

function addHomologyInformationToNodes(genetree, theGene) {
  if (theGene) {
    let theGeneNode = genetree.indices.gene_stable_id[theGene._id];
    let homologs = indexHomologs(theGene);
    let representatives = indexReps(theGene);
    // recursive function that sorts children by identity
    function sortByIdentity(node) {
      let homology;
      let nodeId = node.model.gene_stable_id;
      if (!node.hasOwnProperty('relationToGeneOfInterest')) {
        node.relationToGeneOfInterest = {};
      }
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
        if (!node.model.gene_display_label) {
          node.model.gene_display_label = `[${nodeId}]`;
        }
      }
      else {
        node.children.forEach(function (child) {
          sortByIdentity(child);
        });
        node.children = _.sortBy(node.children, function (n) {
          return 1.0 - n.relationToGeneOfInterest.identity;
        });
        node.relationToGeneOfInterest.identity = node.children[0].relationToGeneOfInterest.identity;
      }
    }
    sortByIdentity(genetree);
  }
}

// IN -> key: homologyType, value: [geneId]
// OUT-> key: geneId, value: homologyType
function indexHomologs(theGene) {
  let homologs = _.get(theGene, 'homology.homologous_genes');
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
  let representative = _.get(theGene, 'homology.gene_tree.representative');
  return _.transform(representative, function (result, rep, repType) {
    result[rep.id] = repType;
    return result;
  }, {});
}

function addTaxonDistanceInformationToNodes(genetree, geneOfInterest, taxonomy) {
  /*const*/ var OUTGROUP_FLAG = -1;

  let theGeneTaxonId = geneOfInterest.taxon_id;

  if (theGeneTaxonId && taxonomy) {
    let theTaxonNode = taxonomy.indices.id[theGeneTaxonId];
    let theTaxonPath = theTaxonNode.getPath();
    let theTaxonPathIds = _.keyBy(theTaxonPath, 'model.id');
    let relationLUT = {};
    let maxima = {
      lcaDistance: 0,
      pathDistance: 0
    };

    genetree.walk(function (node) {
      let nodeTaxonId = node.model.taxon_id || node.model.node_taxon_id;

      // have we already seen this?
      if (relationLUT[nodeTaxonId]) {
        node.relationToGeneOfInterest.taxonomy = relationLUT[nodeTaxonId];
      }
      else {
        let lcaDistance = 0;
        let pathDistance = 0;
        let lca;
        if (nodeTaxonId !== theGeneTaxonId) {
          lca = theTaxonPathIds[nodeTaxonId];
          if (lca) {
            pathDistance = 0;
          }
          else {
            let nodeTaxon = taxonomy.indices.id[nodeTaxonId];
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

        let distances = {
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

export default relateNodesToGeneOfInterest;
