//noinspection JSUnusedLocalSymbols
var React = require('react'); // This var is required after JSX->JS transpile.
var ReactDOM = require('react-dom');
var TreeVis = require('./src/components/TreeVis.jsx');

var geneFixture = require('./fixtures/gene.json');

var GrameneTrees = require('gramene-trees-client');

var exampleGenetree = GrameneTrees.genetree.tree(require('./fixtures/genetree.json'));
var taxonomy = GrameneTrees.taxonomy.tree(require('./fixtures/taxonomy.json'));

ReactDOM.render(
  <TreeVis genetree={exampleGenetree}
           initialGeneOfInterest={geneFixture}
           taxonomy={taxonomy}
           width={600}
           allowGeneSelection={true}/>,
  document.getElementById('tree')
);