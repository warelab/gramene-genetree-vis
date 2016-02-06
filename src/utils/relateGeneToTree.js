function relateNodesToGeneOfInterest(genetree, geneOfInterest, taxonomy) {
  genetree.walk(function (node) {
    node.relationToGeneOfInterest = {};
  });
  addHomologyInformationToNodes(genetree, geneOfInterest);
  addTaxonDistanceInformationToNodes(genetree, geneOfInterest, taxonomy);
}

function addHomologyInformationToNodes(genetree, theGene) {
  var homologs, representatives;
  if (theGene) {
    homologs = indexHomologs(theGene);
    representatives = indexReps(theGene);
    genetree.walk(function (node) {
      var nodeId, homology, repType;
      nodeId = node.model.gene_stable_id;
      if (nodeId) {
        if (nodeId === theGene._id) {
          homology = 'self';
        }
        else {
          homology = homologs[nodeId];
        }

        node.relationToGeneOfInterest.homology = homology;
        node.relationToGeneOfInterest.repType = representatives[nodeId];
      }
    });
  }
}

// IN -> key: homologyType, value: [geneId]
// OUT-> key: geneId, value: homologyType
function indexHomologs(theGene) {
  return _.transform(theGene.homology, function (result, value, key) {
    _.forEach(value, function (id) {
      result[id] = key;
    });
    return result;
  }, {});
}

// IN -> key: representativeType, value: gene doc
// OUT-> key: geneId, value: representativeType
function indexReps(theGene) {
  return _.transform(theGene.representative, function (result, rep, repType) {
    result[rep.id] = repType;
    return result;
  }, {});
}

function addTaxonDistanceInformationToNodes(genetree, geneOfInterest, taxonomy) {
  var theGeneTaxonId, theTaxonNode, theTaxonPath,
    theTaxonPathIds, taxonomy, relationLUT, distances, maxima;

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
            lca = theTaxonNode.lcaWith([nodeTaxon]);
            pathDistance = lca.pathTo(nodeTaxon).length - 1;
          }

          lcaDistance = theTaxonPath.length - _.indexOf(theTaxonPath, lca) - 1;
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
  }
}

module.exports = relateNodesToGeneOfInterest;
