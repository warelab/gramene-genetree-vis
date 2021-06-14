import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import GeneTree from './GeneTree.jsx';
import MSAOverview from './vizTypes/MSAOverview.jsx';
import MSASequence from './vizTypes/MSASequence.jsx';
import Phyloview from './vizTypes/Phyloview.jsx';
import Curation from './vizTypes/Curation.jsx';
import Spinner from './Spinner.jsx';
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
import {Dropdown, DropdownButton, Button, ButtonToolbar, Modal} from 'react-bootstrap';
import { BsGearFill } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/tree.css';
import '../styles/msa.css';
import domainStats from '../utils/domainsStats';
import getNeighborhood from '../utils/getNeighbors';
import positionDomains from '../utils/positionDomains';
import LabelConfig from './LabelConfig';

let pruneTree = GrameneTreesClient.extensions.pruneTree;
let addConsensus = GrameneTreesClient.extensions.addConsensus;

const DEFAULT_MARGIN = 20;
const DEFAULT_ZOOM_HEIGHT = 20;
const DEFAULT_LABEL_WIDTH = 200;
const CURATION_WIDTH = 200;
const MIN_TREE_WIDTH = 50;
const MAX_TREE_WIDTH = 200;
const MIN_VIZ_WIDTH = 150;
const windowResizeDebounceMs = 250;
const rangeChangeDebounceMs = 150;

const localStore = global.localStorage || {};
function getLabelFields() {
  let labelFields = localStore.getItem('genetreeLeafLabels');
  if (labelFields) {
    return JSON.parse(labelFields);
  }
  else {
    return ['model.gene_stable_id'];
  }
}

export default class TreeVis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      geneOfInterest: this.props.initialGeneOfInterest,
      displayMode: 'domains',
      visibleNodes: undefined,
      colorScheme: 'clustal',
      configModal: false,
      labelFields: getLabelFields(),
      MSARange: {
        MSAStart: 0,
        MSAStop: 0
      }
    };
    this.displayModes = [
      {
        id: 'domains',
        label: 'Alignment overview',
        description: <div><b>Alignment overview</b>: Proteins color-coded by InterPro domain. Resize slider to navigate.</div>,
        getComponent: function(app) {
          if (app.geneTreeRoot && app.state.visibleNodes && app.vizWidth && app.domainStats) {
            return React.createElement(MSAOverview, {
              nodes: app.state.visibleNodes,
              rootNode: app.geneTreeRoot,
              width: app.vizWidth,
              height: app.treeHeight,
              margin: app.margin,
              xOffset: app.margin + app.treeWidth + app.labelWidth,
              yOffset: 0,
              controlsHeight: DEFAULT_ZOOM_HEIGHT,
              stats: app.domainStats,
              MSARange: app.state.MSARange,
              handleRangeChange: _.debounce(app.updateMSARange.bind(app),rangeChangeDebounceMs),
              transform: app.transformViz
            });
          }
        }
      },
      {
        id: 'msa',
        label: 'Multiple Sequence Alignment',
        description: <div><b>Multiple Sequence Alignment</b>: Amino acid MSA. Drag slider to reposition.</div>,
        getComponent: function(app) {
          if (app.geneTreeRoot && app.state.visibleNodes && app.vizWidth && app.domainStats) {
            return React.createElement(MSASequence, {
              nodes: app.state.visibleNodes,
              rootNode: app.geneTreeRoot,
              width: app.vizWidth,
              height: app.treeHeight,
              margin: app.margin,
              xOffset: app.margin + app.treeWidth + app.labelWidth,
              yOffset: 0,
              controlsHeight: DEFAULT_ZOOM_HEIGHT,
              stats: app.domainStats,
              colorScheme: app.state.colorScheme,
              MSARange: app.state.MSARange,
              handleRangeChange: _.debounce(app.updateMSARange.bind(app),rangeChangeDebounceMs),
              transform: app.transformViz
            });
          }
        }
      }
    ];
    if (this.props.enablePhyloview) {
      this.displayModes.push(
        {
          id: 'phyloview',
          label: 'Neighborhood conservation',
          description: <div><b>Neighborhood conservation</b>: +/- 10 flanking genes color-coded by gene family.</div>,
          getComponent: function (app) {
            if (app.state.visibleNodes && app.state.neighborhoods && app.vizWidth) {
              return React.createElement(Phyloview, {
                nodes: app.state.visibleNodes,
                queryNode: app.genetree.indices.gene_stable_id[app.state.geneOfInterest._id],
                width: app.vizWidth,
                height: app.treeHeight,
                margin: app.margin,
                xOffset: app.margin + app.treeWidth + app.labelWidth,
                yOffset: 0,
                controlsHeight: DEFAULT_ZOOM_HEIGHT,
                neighborhoods: app.state.neighborhoods,
                maxNCGGenes: app.state.nonCodingGroupLengthDistribution.length - 1,
                numberOfNeighbors: app.props.numberOfNeighbors,
                transform: app.transformViz,
                ensemblUrl: app.props.ensemblUrl
              });
            }
          }
        }
      );
    }
    this.displayModeIdx = _.keyBy(this.displayModes,'id');
  }

  updateMSARange(MSARange) {
    this.setState(MSARange);
  }

  componentDidMount() {
    this.resizeListener = _.debounce(
      this.updateAvailableWidth.bind(this),
      windowResizeDebounceMs
    );
    if (!_.isUndefined(global.addEventListener)) {
      global.addEventListener('resize', this.resizeListener);
    }

    this.domainStats = domainStats(this.props.genetree); // TODO: use a promise and a web worker
    if (!_.isEmpty(this.props.genomesOfInterest)) {
      this.genetree = pruneTree(this.props.genetree, function (node) {
        return (this.props.genomesOfInterest.hasOwnProperty(node.model.taxon_id));
      }.bind(this));
      this.genetree.geneCount = this.props.genetree.geneCount;
    }
    else {
      this.genetree = _.cloneDeep(this.props.genetree);
    }

    addConsensus(this.genetree); // TODO: use a promise
    relateGeneToTree(this.genetree, this.props.initialGeneOfInterest, this.props.taxonomy, this.props.pivotTree);
    if (this.props.enableCuration) {
      setDefaultNodeDisplayInfo(this.genetree, this.props.initialGeneOfInterest, false);
      let curatable = this.props.curatable;
      this.genetree.walk(function (node) {
        if (curatable.hasOwnProperty(node.model.taxon_id)) {
          let parentNode = node.parent;
          while (!parentNode.displayInfo.expanded) {
            parentNode.displayInfo.expanded = true;
            parentNode.displayInfo.expandedCuratable = true;
            parentNode = parentNode.parent;
          }
        }
      })
    }
    else {
      setDefaultNodeDisplayInfo(this.genetree, this.props.initialGeneOfInterest, true);
    }

    // if (this.props.enableCuration && this.genetree.displayInfo.paralogs) {
    //   let node = this.genetree;
    //   node.displayInfo.paralogs.forEach(function (paralog) {
    //     let parentNode = paralog.parent;
    //     while (!parentNode.displayInfo.expanded) {
    //       parentNode.displayInfo.expanded = true;
    //       parentNode.displayInfo.expandedParalogs = true;
    //       parentNode = parentNode.parent
    //     }
    //   });
    // }

    calculateXIndex(this.genetree);
    this.treeHeight = calculateSvgHeight(this.genetree);

    this.geneTreeRoot = _.clone(this.genetree);
    delete this.geneTreeRoot.displayInfo;
    this.geneTreeRoot.displayInfo = {
      expanded: false
    };
    let MSARange = this.state.MSARange;
    MSARange.MSAStop = this.geneTreeRoot.model.consensus.sequence.length;
    this.setState(MSARange);

    calculateXIndex(this.geneTreeRoot);
    layoutNodes(this.geneTreeRoot, 0, this.treeHeight);

    //let ma = alignmentTools.calculateAlignment(this.genetree);
    //if (!_.isEmpty(this.props.genomesOfInterest)) {
    //  let gaps = alignmentTools.findGaps(ma);
    //  alignmentTools.removeGaps(gaps, this.genetree);
    //}
    this.domainHist = positionDomains(this.genetree, true);
    if (this.props.enablePhyloview) {
      let that = this;
      getNeighborhood(this.genetree, this.props.numberOfNeighbors, this.props.genomesOfInterest)
        .then(function (neighborhoodsAndFacets) {
          that.setState(neighborhoodsAndFacets);
        });
    }
    this.updateAvailableWidth();
  }

  componentWillUnmount() {
    if (this.resizeListener) {
      global.removeEventListener('resize', this.resizeListener);
    }
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
    if (this.treeWidth > MAX_TREE_WIDTH) this.treeWidth = MAX_TREE_WIDTH;
    this.vizWidth = (w - this.treeWidth < MIN_VIZ_WIDTH) ? MIN_VIZ_WIDTH : w - this.treeWidth;
    if (this.treeWidth + this.vizWidth + this.labelWidth + 2 * this.margin > this.width) {
      console.log('Is this too small to see everything?');
      this.width = this.treeWidth + this.vizWidth + this.labelWidth + 2 * this.margin;
    }
    if (this.props.enableCuration) {
      this.vizWidth -= CURATION_WIDTH;
    }
    this.transformTree = `translate(${this.margin},${this.margin + DEFAULT_ZOOM_HEIGHT})`;
    this.transformViz = `translate(${this.margin + this.treeWidth + this.labelWidth},0)`;
  }

  handleGeneSelect(geneNode) {
    GrameneClient.genes(geneNode.model.gene_stable_id).then(function (response) {
      let geneOfInterest = response.docs[0];
      relateGeneToTree(this.genetree, geneOfInterest, this.props.taxonomy, this.props.pivotTree);
      setDefaultNodeDisplayInfo(this.genetree, geneOfInterest, true);
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
    if (node.displayInfo.paralogs) {
      if (node.displayInfo.expandedParalogs) {
        // hide these paralogs
        node.displayInfo.paralogs.forEach(function (paralog) {
          let parentNode = paralog.parent;

          const childCallback = (child) => {
            if (child.displayInfo.expanded)
              parentNode.displayInfo.expanded = true;
          };

          while (parentNode !== node) {
            parentNode.displayInfo.expandedParalogs = false;
            // check if any child is expanded
            parentNode.displayInfo.expanded = false;
            parentNode.children.forEach(childCallback);
            parentNode = parentNode.parent
          }
        });
      } else {
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
  }

  toggleConfigModal() {
    this.setState({configModal: !this.state.configModal});
  }

  handleModeSelection(e) {
    this.setState({displayMode: e});
  }

  colorSchemeDropdown() {
    // if (this.state.displayMode === 'msa') {
      function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      }
      const colorSchemes = ['clustal', 'zappo', 'taylor','hydrophobicity','helix_propensity','strand_propensity','turn_propensity','buried_index'];
      let items = colorSchemes.map(function (scheme, i) {
        return (
          <Dropdown.Item key={i} eventKey={i} active={scheme === this.state.colorScheme}
                    onClick={() => this.setState({colorScheme: scheme})}
          >{toTitleCase(scheme.replace('_',' '))}</Dropdown.Item>
        );
      }.bind(this));
      return (
        <DropdownButton id="colorscheme-dropdown"
                        title="Color Scheme"
                        disabled={this.state.displayMode !== 'msa' }
                        variant='outline-dark' size='sm'
        >
          {items}
        </DropdownButton>
      );
    // }
  }

  renderToolbar(activeMode) {
    return (
      <div className="display-mode">
        <ButtonToolbar>
            <Button onClick={() => this.toggleConfigModal()} variant='light' size='sm'>
              <BsGearFill/>
            </Button>
            <DropdownButton id="displaymode-dropdown"
                            title="Display Mode" variant='outline-dark' size='sm'>
              {this.displayModes.map((mode, idx) => {
                return (
                  <Dropdown.Item key={idx}
                                 eventKey={mode.id}
                                 active={activeMode === mode.id}
                                 onClick={() => this.setState({displayMode: mode.id})}>
                    {mode.label}
                  </Dropdown.Item>
                )
              })}
            </DropdownButton>
           {this.colorSchemeDropdown()}
        </ButtonToolbar>
        <span style={{'marginLeft': `${this.margin + this.treeWidth + this.labelWidth}px`, float:'left'}}>
          {this.displayModeIdx[activeMode].description}
        </span>
        {this.props.enableCuration &&
        <div style={{position: 'absolute', left:`${this.margin + this.treeWidth + this.labelWidth + this.vizWidth}px`}}>
          <b>Curate</b>: click to flag genes <div>&nbsp;<span className="curation okay">okay</span>&nbsp;or&nbsp;<span className="curation flag">flag</span></div>
        </div>
        }
      </div>
        )
  }

  updateLabelConfig(labelFields) {
    if (!_.isEqual(labelFields,this.state.labelFields)) {
      localStore.setItem('genetreeLeafLabels',JSON.stringify(labelFields))
      this.setState({labelFields});
    }
  }

  render() {
    if (!(this.state.visibleNodes && this.state.geneDocs)) {
      return <div></div>;
    }
    let genetree = (
      <GeneTree nodes={this.state.visibleNodes}
                labelFields={this.state.labelFields}
                onGeneSelect={this.handleGeneSelect.bind(this)}
                collapseClade={this.collapseClade.bind(this)}
                expandClade={this.expandClade.bind(this)}
                changeParalogVisibility={this.changeParalogVisibility.bind(this)}
                onNodeHover={this.handleNodeHover}
                onNodeUnhover={this.handleNodeUnhover}
                taxonomy={this.props.taxonomy}
                geneDocs={this.state.geneDocs}
      />
    );

    let theViz = this.displayModeIdx[this.state.displayMode].getComponent(this);
    if (!theViz) {
      theViz = React.createElement(Spinner, {
          xOffset: this.margin + this.treeWidth + this.labelWidth + this.vizWidth/2 - 200,
          yOffset: this.treeHeight / 2
        });
    }
    let curation;
    if (this.props.enableCuration) {
      curation = <Curation nodes={this.state.visibleNodes}
                           width={CURATION_WIDTH}
                           height={DEFAULT_ZOOM_HEIGHT}
                           curatable={this.props.curatable}
                           xOffset={this.margin + this.treeWidth + this.labelWidth + this.vizWidth}
                           yOffset={DEFAULT_ZOOM_HEIGHT + this.margin - 10}
                           getCuration={this.props.getCuration}
      />;
    }
    return (
      <div>
        {this.renderToolbar(this.state.displayMode)}
        <Modal
          show={this.state.configModal}
          onHide={this.toggleConfigModal.bind(this)}
          size='lg'
        >
          <Modal.Header closeButton>
            <Modal.Title>Configure labels</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <LabelConfig
              labelFields={this.state.labelFields}
              updateLabelFields={(l)=>this.updateLabelConfig(l)}
            />
          </Modal.Body>
        </Modal>
        <div className="genetree-vis">
          <svg width={this.width} height={this.treeHeight + 2 * this.margin + DEFAULT_ZOOM_HEIGHT}>
            <g className="tree-wrapper" transform={this.transformTree}>
              {genetree}
            </g>
            {theViz}
            {curation}
          </svg>
        </div>
      </div>
    )
  }
}

TreeVis.propTypes = {
  margin: PropTypes.number,
  genetree: PropTypes.object.isRequired,
  initialGeneOfInterest: PropTypes.object,
  genomesOfInterest: PropTypes.object,
  taxonomy: PropTypes.object,
  pivotTree: PropTypes.bool,
  numberOfNeighbors: PropTypes.number,
  enablePhyloview: PropTypes.bool,
  ensemblUrl: PropTypes.string.isRequired
};
