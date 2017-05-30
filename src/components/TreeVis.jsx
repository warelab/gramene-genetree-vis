import React from 'react';
import ReactDOM from 'react-dom';
import GeneTree from './GeneTree.jsx';
import _ from 'lodash';
import {client as GrameneClient} from 'gramene-search-client';
import GrameneTreesClient from 'gramene-trees-client';
import relateGeneToTree from '../utils/relateGeneToTree';
import calculateSvgHeight from '../utils/calculateSvgHeight';
import layoutNodes from '../utils/layoutNodes';
import {
  setDefaultNodeDisplayInfo,
  calculateXIndex,
  makeCladeVisible,
  makeCladeInvisible,
  makeNodeVisible,
  makeNodeInvisible
} from "../utils/visibleNodes";
let pruneTree = GrameneTreesClient.extensions.pruneTree;

const DEFAULT_MARGIN = 10;
const DEFAULT_LABEL_WIDTH = 200;
const MIN_TREE_WIDTH = 50;
const MIN_VIZ_WIDTH = 150;
const windowResizeDebounceMs = 250;

const DISPLAY_DOMAINS     = "domains";
const DISPLAY_MSA         = "msa";
const DISPLAY_PHYLOVIEW   = "phyloview";
const NUM_NEIGHBORS       = 10;

export default class TreeVis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      geneOfInterest: this.props.initialGeneOfInterest,
    }
  }

  componentWillMount() {
    // kick off web workers to prep the tree and viz components
    this.resizeListener = _.debounce(
      this.updateAvailableWidth.bind(this),
      windowResizeDebounceMs
    );
    if (!_.isUndefined(global.addEventListener)) {
      global.addEventListener('resize', this.resizeListener);
    }

    // this.domainStats = domainStats(this.props.genetree); // do this to all genomes
    if (!_.isEmpty(this.props.genomesOfInterest)) {
      this.genetree = pruneTree(this.props.genetree, function (node) {
        return (this.props.genomesOfInterest.hasOwnProperty(node.model.taxon_id));
      }.bind(this));
      this.genetree.geneCount = this.props.genetree.geneCount;
    }
    else {
      this.genetree = _.clone(this.props.genetree);
    }

    relateGeneToTree(this.genetree, this.props.initialGeneOfInterest, this.props.taxonomy, this.props.pivotTree);
    setDefaultNodeDisplayInfo(this.genetree, this.props.initialGeneOfInterest);
    calculateXIndex(this.genetree);
    this.treeHeight = calculateSvgHeight(this.genetree);
  }

  componentWillUnmount() {
    if (this.resizeListener) {
      global.removeEventListener('resize', this.resizeListener);
    }
  }

  componentDidMount() {
    this.updateAvailableWidth();
  }

  updateAvailableWidth() {
    const DOMNode = ReactDOM.findDOMNode(this);
    const parentWidth = DOMNode.parentNode ? DOMNode.parentNode.clientWidth : DOMNode.clientWidth;
    if (this.width !== parentWidth) {
      this.width = parentWidth;
      this.initHeightAndMargin();
      this.setState({visibleNodes: layoutNodes(this.genetree, this.treeWidth, this.treeHeight)});
    }
  }

  initHeightAndMargin() {
    this.margin = this.props.margin || DEFAULT_MARGIN;
    this.labelWidth = this.props.labelWidth || DEFAULT_LABEL_WIDTH;
    const w = this.width - this.labelWidth - (2 * this.margin);
    this.treeWidth = (.25 * w < MIN_TREE_WIDTH) ? MIN_TREE_WIDTH : Math.floor(.25 * w);
    this.vizWidth = (.75 * w < MIN_VIZ_WIDTH) ? MIN_VIZ_WIDTH : Math.floor(.75 * w);
    if (this.treeWidth + this.vizWidth + this.labelWidth + 2 * this.margin > this.width) {
      console.log('Is this too small to see everything?');
      this.width = this.treeWidth + this.vizWidth + this.labelWidth + 2 * this.margin;
    }
    this.consensusHeight = 0;
    const treeTop = this.margin + this.consensusHeight;
    this.transformTree = 'translate(' + this.margin + ', ' + treeTop + ')';
  }

  handleGeneSelect(geneNode) {
    GrameneClient.genes(geneNode.model.gene_stable_id).then(function (response) {
      let geneOfInterest = response.docs[0];
      relateGeneToTree(this.genetree, geneOfInterest, this.props.taxonomy, this.props.pivotTree);
      setDefaultNodeDisplayInfo(this.genetree, geneOfInterest);
      calculateXIndex(this.genetree);
      this.treeHeight = calculateSvgHeight(this.genetree);
      let visibleNodes = layoutNodes(this.genetree, this.treeWidth, this.treeHeight);
      this.setState({geneOfInterest, visibleNodes});
    }.bind(this));
  }

  expandClade(node, recursive) {
    if (recursive) {
      makeCladeVisible(node);
    }
    else {
      makeNodeVisible(node);
    }
    this.updateVisibleNodes();
  }

  collapseClade(node, recursive) {
    if (recursive) {
      makeCladeInvisible(node);
    }
    else {
      makeNodeInvisible(node);
    }
    this.updateVisibleNodes();
  }

  updateVisibleNodes() {
    calculateXIndex(this.genetree);
    this.treeHeight = calculateSvgHeight(this.genetree);
    const newVisibleNodes = layoutNodes(
      this.genetree,
      this.treeWidth,
      this.treeHeight
    );
    this.setState({
      visibleNodes: newVisibleNodes
    });
  }

  handleNodeUnhover(node) {
    if (this.state.hoveredNode === node) {
      this.setState({hoveredNode: undefined});
    }
  }

  handleNodeHover(node) {
    this.setState({hoveredNode: node});
  }

  changeParalogVisibility(node) {
    if (node.displayInfo.expandedParalogs) {
      // hide these paralogs
      node.displayInfo.paralogs.forEach(function (paralog) {
        let parentNode = paralog.parent;
        while (parentNode != node) {
          parentNode.displayInfo.expandedParalogs = false;
          // check if any child is expanded
          parentNode.displayInfo.expanded = false;
          parentNode.children.forEach((child) => {
            if (child.displayInfo.expanded)
              parentNode.displayInfo.expanded = true;
          });
          parentNode = parentNode.parent
        }
      });
    }
    else {
      node.displayInfo.paralogs.forEach(function (paralog) {
        let parentNode = paralog.parent;
        while (!parentNode.displayInfo.expanded) {
          parentNode.displayInfo.expanded = true;
          parentNode.displayInfo.expandedParalogs = true;
          parentNode = parentNode.parent
        }
      });
    }
    this.updateVisibleNodes();
  }

  render() {
    if (!this.state.visibleNodes) {
      return <div></div>;
    }
    let genetree = (
      <GeneTree nodes={this.state.visibleNodes}
                onGeneSelect={this.handleGeneSelect.bind(this)}
                collapseClade={this.collapseClade.bind(this)}
                expandClade={this.expandClade.bind(this)}
                changeParalogVisibility={this.changeParalogVisibility.bind(this)}
                onNodeHover={this.handleNodeHover}
                onNodeUnhover={this.handleNodeUnhover}
                taxonomy={this.props.taxonomy}
                overlaysContainer={this.overlaysContainer}
      />
    );

    return (
      <div className="genetree-vis">
        <svg width={this.width} height={this.treeHeight + 2 * this.margin}>
          <g className="tree-wrapper" transform={this.transformTree}>
            {genetree}
          </g>
        </svg>
        <div ref={(elem) => {this.overlaysContainer = elem}}
             className="overlays">
        </div>
      </div>
    )
  }
}

TreeVis.propTypes = {
  margin: React.PropTypes.number,
  genetree: React.PropTypes.object.isRequired,
  initialGeneOfInterest: React.PropTypes.object,
  genomesOfInterest: React.PropTypes.object,
  taxonomy: React.PropTypes.object,
  pivotTree: React.PropTypes.bool,
  numberOfNeighbors: React.PropTypes.number,
  enablePhyloview: React.PropTypes.bool
};
