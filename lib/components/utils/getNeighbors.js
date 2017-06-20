"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getNeighborhood;

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _grameneSearchClient = require("gramene-search-client");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var facets = {
  roots: {
    type: 'terms',
    field: 'gene_tree_root_taxon_id',
    mincount: 1,
    limit: 100,
    collection: 'taxonomy'
  },
  domains: {
    type: 'terms',
    field: 'domains__ancestors',
    mincount: 1,
    limit: 100
  },
  GO: {
    type: 'terms',
    field: 'GO__ancestors',
    mincount: 1,
    limit: 100
  },
  pathways: {
    type: 'terms',
    field: 'pathways__ancestors',
    mincount: 1,
    limit: 100
  }
};

function search(query) {
  return _grameneSearchClient.client.grameneClient.then(function (client) {
    return client['Search'].genes(query).then(function (response) {
      return response.obj;
    });
  });
}

function details(collection, idList) {
  return _grameneSearchClient.client.grameneClient.then(function (client) {
    return client['Data access'][collection]({ idList: idList, rows: -1 }).then(function (response) {
      return response.obj;
    });
  });
}

function centralGenePromise(queryString) {
  return search({
    q: queryString,
    rows: 10000,
    start: 0,
    fl: ['compara_idx', 'gene_idx', 'id']
  });
}

function allGenesPromise(queryString, numberOfNeighbors) {
  var fieldToQuery = 20;
  if (numberOfNeighbors <= 10) {
    fieldToQuery = 10;
  }
  if (numberOfNeighbors <= 5) {
    fieldToQuery = 5;
  }
  return search({
    q: "{!graph from=compara_neighbors_" + fieldToQuery + " to=compara_idx_multi maxDepth=1}" + queryString,
    rows: 100000,
    start: 0,
    fl: ["id", "name", "compara_idx", "gene_idx", "gene_tree", "taxon_id", "region", "strand", "biotype", "gene_tree_root_taxon_id", "description", "start", "end", "domains__ancestors", "GO__ancestors", "pathways__ancestors"],
    'json.facet': JSON.stringify(facets)
  });
}

function indexGenes(neighborhoodResponse) {
  var genes = {};
  neighborhoodResponse.response.docs.forEach(function (doc) {
    genes[doc.gene_idx] = doc;
  });
  return { genes: genes, facets: neighborhoodResponse.facets };
}

function lookupFacetInfo(neighborhoodResponse) {
  var facetCounts = _lodash2.default.cloneDeep(facets);
  var detailsPromises = [];
  _lodash2.default.forEach(facetCounts, function (facetCount, f) {
    if (neighborhoodResponse.facets.hasOwnProperty(f)) {
      var idList = [];
      facetCount.counts = neighborhoodResponse.facets[f].buckets.map(function (bucket) {
        idList.push(bucket.val);
        return { id: bucket.val, count: bucket.count };
      });
      if (idList.length > 0) {
        var collection = facetCount.hasOwnProperty('collection') ? facetCount.collection : f;
        detailsPromises.push(details(collection, idList).then(function (docs) {
          var details = {};
          docs.forEach(function (doc) {
            details[doc._id] = doc;
          });
          facetCount.counts.forEach(function (bucket) {
            bucket.info = details[bucket.id];
          });
          return 0;
        }));
      }
    }
  });
  // run all the promises
  return _q2.default.all(detailsPromises).then(function () {
    neighborhoodResponse.facets = facetCounts;
    return neighborhoodResponse;
  });
}

function groupGenesIntoNeighborhoods(centralGenes, allGenesAndFacets, numberOfNeighbors, sortedIdsAndIdentities) {
  var allGenes = allGenesAndFacets.genes;
  var neighborhoods = [];
  var geneDocs = _lodash2.default.keyBy(centralGenes.response.docs, 'id');
  sortedIdsAndIdentities.forEach(function (geneIdAndIdentity) {
    var geneId = geneIdAndIdentity.id;
    var doc = geneDocs[geneId];
    if (doc) {
      var geneNeighborhood = {
        center_gene_id: doc.id,
        center_identity: geneIdAndIdentity.identity,
        center_idx: 0, // tbd
        genes: [] // tbd
      };
      var idx = doc.gene_idx;
      var first = idx - numberOfNeighbors;
      var last = idx - numberOfNeighbors;
      // extend first and last to capture numberOfNeighbors compara genes
      var compara_idx = doc.compara_idx;
      var first_compara = compara_idx - numberOfNeighbors;
      var last_compara = compara_idx + numberOfNeighbors;
      while (!!allGenes[first] && allGenes[first].compara_idx > first_compara) {
        first--;
      }while (!!allGenes[last] && allGenes[last].compara_idx < last_compara) {
        last++;
      }for (var i = first; i <= last; i++) {
        if (!!allGenes[i] && allGenes[i].taxon_id === allGenes[idx].taxon_id && allGenes[i].region === allGenes[idx].region) {
          if (i === idx) {
            geneNeighborhood.center_idx = geneNeighborhood.genes.length;
          }
          allGenes[i].tree_id = allGenes[i].gene_tree;
          allGenes[i].orientation = allGenes[i].strand === 1 ? '+' : '-';
          geneNeighborhood.genes.push(allGenes[i]);
        }
      }
      neighborhoods.push(geneNeighborhood);
    }
  });
  return { neighborhoods: neighborhoods, facets: allGenesAndFacets.facets };
}

function reverseNeigborhoodsIfGeneOfInterestOnNegativeStrand(neighborhoodsAndFacets) {
  var neighborhoods = neighborhoodsAndFacets.neighborhoods.map(function (neighborhood) {
    var genes = neighborhood.genes,
        center_idx = neighborhood.center_idx;

    var centerGenes = genes[center_idx];
    centerGenes.identity = neighborhood.center_identity;
    if (centerGenes.orientation === '-') {
      genes.reverse();
      genes.forEach(function (gene) {
        gene.orientation = gene.orientation === '-' ? '+' : '-';
      });
      neighborhood.center_idx = genes.length - 1 - neighborhood.center_idx;
      neighborhood.strand = 'forward';
    } else {
      neighborhood.strand = 'reverse';
    }
    return neighborhood;
  });
  neighborhoodsAndFacets.neighborhoods = _lodash2.default.keyBy(neighborhoods, 'center_gene_id');
  return neighborhoodsAndFacets;
}

function getAndIndexGenes(queryString, numberOfNeighbors) {
  return allGenesPromise(queryString, numberOfNeighbors).then(lookupFacetInfo).then(indexGenes);
}

function getNeighborhood(genetree, numberOfNeighbors, genomesOfInterest) {
  var queryString = "gene_tree:" + genetree.model._id;
  if (!_lodash2.default.isEmpty(genomesOfInterest)) {
    var taxa = Object.keys(genomesOfInterest).join(' ');
    queryString = queryString + " AND taxon_id:(" + taxa + ")";
  }
  return _q2.default.all([centralGenePromise(queryString), getAndIndexGenes(queryString, numberOfNeighbors), numberOfNeighbors, genetree.leafNodes().map(function (n) {
    return {
      id: n.model.gene_stable_id,
      identity: n.relationToGeneOfInterest.identity
    };
  })]).spread(groupGenesIntoNeighborhoods).then(reverseNeigborhoodsIfGeneOfInterestOnNegativeStrand);
}