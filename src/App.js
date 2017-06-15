import React, { Component } from 'react';
import './App.css';

import TreeVis from './components/TreeVis.jsx';

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

class App extends Component {
  render() {
    return <TreeVis genetree={exampleGenetree}
           initialGeneOfInterest={geneFixture}
           taxonomy={taxonomy}
           genomesOfInterest={genomesOfInterest}
           width={1200}
           allowGeneSelection={true}
           pivotTree={true}
           enablePhyloview={true}
           numberOfNeighbors={10}
           />;
  }
}

export default App;
