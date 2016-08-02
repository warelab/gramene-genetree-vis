'use strict';

//noinspection JSUnusedLocalSymbols
var React = require('react'); // This var is required after JSX->JS transpile.
var ReactDOM = require('react-dom');
var TreeVis = require('./src/components/TreeVis.jsx');

var geneFixture = require('./fixtures/GRMZM2G105791.json');

var GrameneTrees = require('gramene-trees-client');

var exampleGenetree = GrameneTrees.genetree.tree(require('./fixtures/waxytree.json'));
var taxonomy = GrameneTrees.taxonomy.tree(require('./fixtures/taxonomy.json'));

var genomesOfInterest = {
  37022 : taxonomy.indices.id[3702],
  4577 : taxonomy.indices.id[4577],
  39947 : taxonomy.indices.id[39947]
};

ReactDOM.render(
  <TreeVis genetree={exampleGenetree}
           initialGeneOfInterest={geneFixture}
           taxonomy={taxonomy}
           genomesOfInterest={genomesOfInterest}
           width={1200}
           allowGeneSelection={true}/>,
  document.getElementById('tree')
);