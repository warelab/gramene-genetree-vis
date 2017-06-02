import React from 'react'; // This var is required after JSX->JS transpile.
import ReactDOM from 'react-dom';
import TreeVis from './src/components/TreeVis.jsx';

let geneFixture = require('./fixtures/Zm00001d018033.json');

let GrameneTrees = require('gramene-trees-client');

let exampleGenetree = GrameneTrees.genetree.tree(require('./fixtures/waxytree.json'));
let taxonomy = GrameneTrees.taxonomy.tree(require('./fixtures/taxonomy.json'));

let genomesOfInterest = {
  3702 : taxonomy.indices.id[3702],
  4558 : taxonomy.indices.id[4558],
  4577 : taxonomy.indices.id[4577],
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
           />,
  document.getElementById('tree')
);