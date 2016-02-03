var React = require('react');
var ReactDOM = require('react-dom');
var TreeVis = require('./src/components/TreeVis.jsx');

var genetreeFixture = require('./fixtures/genetree.json');
var geneFixture = require('./fixtures/gene.json');

var GrameneTrees = require('gramene-trees-client');

var exampleGenetree = GrameneTrees.genetree.tree(genetreeFixture);

ReactDOM.render(
  <TreeVis genetree={exampleGenetree}
           geneOfInterest={geneFixture}
           width={480}
           height={800}/>,
  document.getElementById('tree')
);