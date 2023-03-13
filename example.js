import React from 'react'; // This var is required after JSX->JS transpile.
import ReactDOM from 'react-dom';
import TreeVis from './src/components/TreeVis.js';

let geneFixture = require('./fixtures/maize_waxy_gene.json');

let GrameneTrees = require('gramene-trees-client');

let exampleGenetree = GrameneTrees.genetree.tree(require('./fixtures/maize_waxy_tree.json'));
let taxonomy = GrameneTrees.taxonomy.tree(require('./fixtures/maize_taxonomy.json'));

let genomesOfInterest = {
  3702 : taxonomy.indices.id[3702],
  4558 : taxonomy.indices.id[4558],
  4577000 : taxonomy.indices.id[4577000],
  39947 : taxonomy.indices.id[39947]
};

ReactDOM.render(
  <TreeVis genetree={exampleGenetree}
           initialGeneOfInterest={geneFixture}
           taxonomy={taxonomy}
           genomesOfInterest={{}}
           width={1200}
           allowGeneSelection={true}
           pivotTree={true}
           enablePhyloview={true}
           numberOfNeighbors={10}
           ensemblUrl='http://ensembl.gramene.org'
           />,
  document.getElementById('tree')
);