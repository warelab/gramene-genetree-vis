'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
import Range from 'rc-slider/lib/Range';
import Slider from 'rc-slider/lib/Slider';
import {
  MenuItem,
  DropdownButton,
  Button,
  ButtonToolbar,
  Dropdown,
} from 'react-bootstrap';
var _ = require('lodash');
var GrameneClient = require('gramene-search-client').client;
var GeneTree = require('./GeneTree.jsx');
var PositionedAlignment = require('./PositionedAlignment.jsx');
var PositionedDomains = require('./PositionedDomains.jsx');
var PositionedExonJunctions = require('./PositionedExonJunctions.jsx');

var relateGeneToTree = require('../utils/relateGeneToTree');
var nodeCoordinates = require('../utils/nodeCoordinates');
var calculateSvgHeight = require('../utils/calculateSvgHeight');
var domainStats = require('../utils/domainsStats').domainStats;
var alignmentTools = require('../utils/calculateAlignment');
var positionDomains = require('../utils/positionDomains');
import {
  setDefaultNodeDisplayInfo,
  makeCladeVisible,
  makeCladeInvisible,
  makeNodeVisible,
  makeNodeInvisible
} from "../utils/visibleNodes";
var pruneTree = require('gramene-trees-client').extensions.pruneTree;
var addConsensus = require('gramene-trees-client').extensions.addConsensus;
import { getNeighborhood } from '../utils/getNeighbors';

const DEFAULT_MARGIN = 10;
const DEFAULT_LABEL_WIDTH = 200;
const MAX_TREE_WIDTH = 200;
const MIN_ALIGN_WIDTH = 200;
const windowResizeDebounceMs = 250;

const DISPLAY_DOMAINS     = "domains";
const DISPLAY_MSA         = "msa";
const DISPLAY_PHYLOVIEW   = "phyloview";
const NUM_NEIGHBORS       = 10;


var TreeVis = React.createClass({
  propTypes: {
    // width: React.PropTypes.number.isRequired,
    //height: React.PropTypes.number.isRequired,
    margin: React.PropTypes.number,
    genetree: React.PropTypes.object.isRequired,
    initialGeneOfInterest: React.PropTypes.object,
    genomesOfInterest: React.PropTypes.object,
    taxonomy: React.PropTypes.object,
    allowGeneSelection: React.PropTypes.bool,
    numberOfNeighbors: React.PropTypes.number
  },

  getInitialState: function () {
    return {
      hoveredNode: undefined,
      geneOfInterest: this.props.initialGeneOfInterest,
      colorScheme: 'clustal',
      displayMode: DISPLAY_DOMAINS,
    };
  },

  componentWillMount: function () {
    this.genetree = _.cloneDeep(this.props.genetree);

    this.domainStats = domainStats(this.genetree); // do this to all genomes

    this.resizeListener = _.debounce(
      this.updateAvailableWidth,
      windowResizeDebounceMs
    );

    if (!_.isUndefined(global.addEventListener)) {
      global.addEventListener('resize', this.resizeListener);
    }

    if (!_.isEmpty(this.props.genomesOfInterest)) {
      this.genetree = pruneTree(this.props.genetree, this.keepNode());
      this.genetree.geneCount = this.props.genetree.geneCount;
    }

    relateGeneToTree(this.genetree, this.props.initialGeneOfInterest, this.props.taxonomy);
    setDefaultNodeDisplayInfo(this.genetree, this.props.initialGeneOfInterest);
    this.initializeAlignments(this.props)();
    let that = this;
    getNeighborhood(this.genetree, this.props.numberOfNeighbors || NUM_NEIGHBORS, this.props.genomesOfInterest)
      .then(function(neighborhoodsAndFacets) {
        that.setState(neighborhoodsAndFacets);
      });
  },

  componentDidUpdate: function () {
    if (this.state.displayMode === DISPLAY_MSA ) {
      let Xmin = this.MSARange.MSAStart * this.charWidth;
      let MSA = document.getElementsByClassName('MSAlignments-wrapper');
      MSA[0].scrollLeft = Xmin;
    }
  },

  componentDidMount: function () {
    this.updateAvailableWidth();
  },

  componentWillUnmount: function () {
    if (this.resizeListener) {
      global.removeEventListener('resize', this.resizeListener);
    }
  },

  componentWillReceiveProps: function (nextProps) {
    function haveSameKeys(a, b) {
      return _.size(a) === _.size(b)
        && _.every(b, (val, key) => !!a[key])
    }

    if (!haveSameKeys(nextProps.genomesOfInterest, this.props.genomesOfInterest)) {
      this.genetree = _.cloneDeep(nextProps.genetree);
      if (!_.isEmpty(nextProps.genomesOfInterest)) {
        this.genetree = pruneTree(this.genetree, this.keepNode(nextProps));
        this.genetree.geneCount = nextProps.genetree.geneCount;
      }
      relateGeneToTree(this.genetree, this.props.initialGeneOfInterest, this.props.taxonomy);
      setDefaultNodeDisplayInfo(this.genetree, nextProps.initialGeneOfInterest);
      this.initializeAlignments(nextProps)();
      // this.reinitHeight();
      this.setState({visibleNodes: this.nodeCoordinates()});
    }
  },

  updateAvailableWidth: function () {
    const parentWidth = ReactDOM.findDOMNode(this).parentNode.clientWidth;
    if (this.width !== parentWidth) {
      this.width = parentWidth;
      this.initHeightAndMargin();
      this.setState({visibleNodes: this.nodeCoordinates()});
    }
  },

  keepNode: function (props = this.props) {
    return function _keepNode(node) {
      if (props.genomesOfInterest.hasOwnProperty(node.model.taxon_id)) return true;
      if (node.model.gene_stable_id &&
        _.has(props, 'initialGeneOfInterest.homology.gene_tree.representative.model.id')) {
        if (node.model.gene_stable_id === props.initialGeneOfInterest.homology.gene_tree.representative.model.id) {
          return true;
        }
      }
      return false;
    }
  },

  initializeAlignments: function (props = this.props) {
    return function _initializeAlignments() {

      addConsensus(this.genetree);
      this.geneTreeRoot = _.clone(this.genetree);
      delete this.geneTreeRoot.displayInfo;
      this.geneTreeRoot.displayInfo = {
        expanded: false
      };
      nodeCoordinates(this.geneTreeRoot, 1);
      alignmentTools.clean();
      var multipleAlignment = alignmentTools.calculateAlignment(this.genetree); // not necessarily all genomes
      if (!_.isEmpty(props.genomesOfInterest)) {
        // find gaps in multiple alignment
        var gaps = alignmentTools.findGaps(multipleAlignment);
        // remove gaps from alignments
        alignmentTools.removeGaps(gaps, this.genetree);
      }
      this.domainHist = positionDomains(this.genetree, true);

    }.bind(this);
  },

  initHeightAndMargin: function () {
    this.margin = this.props.margin || DEFAULT_MARGIN;
    this.labelWidth = this.props.labelWidth || DEFAULT_LABEL_WIDTH;
    this.w = this.width - this.labelWidth - (2 * this.margin);

    this.treeWidth = this.w / 2 > MAX_TREE_WIDTH ? MAX_TREE_WIDTH : this.w / 2;
    this.treeHeight = calculateSvgHeight(this.genetree);

    this.alignmentsWidth = this.w - this.treeWidth;
    this.displayAlignments = true;
    if (this.alignmentsWidth < MIN_ALIGN_WIDTH) {
      // this.displayAlignments = false;
      this.treeWidth += this.alignmentsWidth;
      this.consensusHeight = 0;
    }
    else {
      this.charWidth = 7.2065;
      this.consensusHeight = 30;
      this.consensusLength = this.genetree.model.consensus.sequence.length;
      this.consensusWidth = Math.floor(this.alignmentsWidth / this.charWidth);
      this.vbHeight = this.treeHeight + 2 * this.margin + 3;
    }
    const treeTop = this.margin + this.consensusHeight;
    const alignmentTop = treeTop - 7;
    const consensusTop = this.margin;
    this.transformTree = 'translate(' + this.margin + ', ' + treeTop + ')';
    this.alignmentOrigin = this.margin + this.treeWidth + this.labelWidth;
    this.transformAlignments = 'translate(' + this.alignmentOrigin + ', ' + alignmentTop + ')';
    this.transformConsensus = 'translate(' + this.alignmentOrigin + ', ' + consensusTop + ')';
  },

  nodeCoordinates: function () {
    return nodeCoordinates(this.genetree, this.treeWidth);
  },

  handleGeneSelect: function (geneNode) {
    if (this.props.allowGeneSelection) {
      GrameneClient.genes(geneNode.model.gene_stable_id).then(function (response) {
        var geneOfInterest = response.docs[0];
        relateGeneToTree(this.genetree, geneOfInterest, this.props.taxonomy);
        setDefaultNodeDisplayInfo(this.genetree, geneOfInterest);
        var visibleNodes = this.nodeCoordinates();
        this.initHeightAndMargin();
        this.setState({geneOfInterest, visibleNodes});
      }.bind(this));
    }
  },

  changeCladeVisibility: function (node, recursive) {

    if (node.displayInfo.expanded) {
      if (recursive) {
        makeCladeInvisible(node);
      }
      else {
        makeNodeInvisible(node);
      }
    }
    else {
      if (recursive) {
        makeCladeVisible(node);
      }
      else {
        makeNodeVisible(node)
      }
    }

    const newVisibleNodes = nodeCoordinates(
      this.genetree,
      this.treeWidth
    );
    this.initHeightAndMargin();
    this.setState({
      visibleNodes: newVisibleNodes
    });
  },

  handleNodeUnhover: function (node) {
    if (this.state.hoveredNode === node) {
      this.setState({hoveredNode: undefined});
    }
  },
  handleNodeHover: function (node) {
    this.setState({hoveredNode: node});
  },

  changeParalogVisibility: function (node) {
    if (node.displayInfo.expandedParalogs) {
      // hide these paralogs
      node.displayInfo.paralogs.forEach(function (paralog) {
        var parentNode = paralog.parent;
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
        var parentNode = paralog.parent;
        while (!parentNode.displayInfo.expanded) {
          parentNode.displayInfo.expanded = true;
          parentNode.displayInfo.expandedParalogs = true;
          parentNode = parentNode.parent
        }
      });
    }
    const newVisibleNodes = nodeCoordinates(
      this.genetree,
      this.treeWidth
    );
    // this.reinitHeight();
    this.initHeightAndMargin();
    this.setState({
      visibleNodes: newVisibleNodes
    });
  },

  renderBackground: function () {
    if (false) {
      var bgStyle = {fill: '#fff', stroke: false};
      var h = calculateSvgHeight(this.genetree) + (2 * this.margin);
      var y = -this.margin;
      var x = -this.margin / 2;
      var w = this.alignmentsWidth + this.margin;
      return (
        <rect key='bg'
              width={w}
              height={h}
              x={x}
              y={y}
              style={bgStyle}/>
      );
    }
  },

  renderConsensus: function () {
    if (this.displayAlignments) {
      var w = this.alignmentsWidth;
      var alignment = alignmentTools.calculateAlignment(this.geneTreeRoot);
      var domains = positionDomains(this.geneTreeRoot);
      var consensus = (
        <g>
          <PositionedAlignment node={this.geneTreeRoot} width={this.alignmentsWidth} stats={this.domainStats}
                               domains={domains}
                               highlight={false} alignment={alignment}/>
          <PositionedDomains node={this.geneTreeRoot} width={this.alignmentsWidth} stats={this.domainStats}
                             domains={domains}
                             alignment={alignment}/>
        </g>
      );
      var viewBoxMinX = 0;
      var viewBoxMinY = -3;
      var viewBoxWidth = this.consensusLength;
      var viewBoxHeight = this.consensusHeight;
      var vb = `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`;
      return (
        <g className="consensus-wrapper" transform={this.transformConsensus}>
          <svg width={w}
               height={this.consensusHeight} viewBox={vb} preserveAspectRatio="none">
            {consensus}
          </svg>
        </g>
      );
    }
  },

  renderAlignments: function () {
    if (this.displayAlignments) {
      var width = this.alignmentsWidth;
      var viewBoxMinX = this.MSARange.MSAStart;
      var viewBoxMinY = -3;
      var viewBoxWidth = this.MSARange.MSAStop - this.MSARange.MSAStart;
      var viewBoxHeight = this.vbHeight;
      if (this.state.displayMode === DISPLAY_MSA) {
        viewBoxWidth *= this.charWidth;
        viewBoxMinX *= this.charWidth;
      }
      var vb = `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`;
      var MSAlignments = this.state.visibleNodes.map(function (node) {
        if (node.model.gene_stable_id || !node.displayInfo.expanded) {

          var MSAProps = {
            key: node.model.node_id,
            className: this.state.colorScheme
          };
          let idx = 0;
          let chars = node.model.consensus.sequence;
          let spans = [];
          spans[0] = chars[0];
          let j = 0;
          for (let i = 1; i < chars.length; i++) {
            if (chars[i] === chars[i - 1]) {
              spans[j] += chars[i]
            }
            else {
              spans.push(chars[i]);
              j++;
            }
          }

          let msaRow = spans.map(function (base) {
            if (base.charAt(0) === '-')
              return (<span key={++idx} className="gap">{base}</span>)
            else
              return (<span key={++idx} className={base.charAt(0)}>{base}</span>)
          });
          return (
            <div {...MSAProps}>{msaRow}</div>
          );
        }
      }.bind(this));
      var alignments = this.state.visibleNodes.map(function (node) {
        if (node.model.gene_stable_id || !node.displayInfo.expanded) {

          var alignment = alignmentTools.calculateAlignment(node);
          var pej;
          if (node.model.exon_junctions) {
            pej = (
              <PositionedExonJunctions node={node} width={width} alignment={alignment}/>
            )
          }
          var domains = positionDomains(node);
          return (
            <g key={node.model.node_id}>
              {pej}
              <PositionedAlignment node={node} width={width} stats={this.domainStats} domains={domains}
                                   highlight={false} alignment={alignment}/>
              <PositionedDomains node={node} width={width} stats={this.domainStats} domains={domains}
                                 alignment={alignment}/>
            </g>
          )
        }
      }.bind(this));

      if (this.state.displayMode === DISPLAY_MSA ) {
        return (
          // <g transform={this.transformAlignments}>
          <foreignObject x={this.alignmentOrigin} y={this.margin + this.consensusHeight - 7}
                         width={this.alignmentsWidth} height={viewBoxHeight}>
            <div className="MSAlignments-wrapper"
                 onLoad={() => this.scrollLeft = this.MSARange.MSAStart * this.charWidth}
            >
              {MSAlignments}
            </div>
          </foreignObject>
          // </g>
        )
      }
      else {
        return (
          <g className="alignments-wrapper" transform={this.transformAlignments}>
            <svg ref={(svg) => this.alignmentsSVG = svg} width={this.alignmentsWidth} height={viewBoxHeight}
                 viewBox={vb} preserveAspectRatio="none">
              {this.renderBackground()}
              {alignments}
            </svg>
          </g>
        );
      }
    }
  },

  renderPhyloview: function () {
    if (this.state.neighborhoods) {
      return (
        <div>phyloview placeholder</div>
      )
    }
  },

  handleSliderChange(e) {
    if (this.state.displayMode === DISPLAY_MSA ) {
      this.MSARange = {
        MSAStart: e,
        MSAStop: Math.min(e + Math.floor(this.alignmentsWidth / this.charWidth), this.consensusLength)
      };
      let Xmin = e * this.charWidth;
      let rows = document.getElementsByClassName('MSAlignments-wrapper');
      rows[0].scrollLeft = Xmin;
    }
    else {
      this.MSARange = {MSAStart: e[0], MSAStop: e[1]};
      var MSAWidth = e[1] - e[0];
      var Xmin = e[0];
      var vb = `${Xmin} -3 ${MSAWidth} ${this.vbHeight}`;
      this.alignmentsSVG.setAttribute('viewBox', vb);
    }
  },

  handleModeSelection(e) {
    console.log('handelModeSelection',e);
    this.displayAlignments = (e === DISPLAY_DOMAINS || e === DISPLAY_MSA);
    this.setState({displayMode: e});
  },

  render: function () {
    var genetree, height;

    if (!this.width) {
      return <div></div>;
    }
    this.treeHeight = calculateSvgHeight(this.genetree);
    this.vbHeight = this.treeHeight + 2 * this.margin + 3;

    height = this.treeHeight + 2 * this.margin + this.consensusHeight + 3;

    if (this.state.visibleNodes) {
      genetree = (
        <GeneTree nodes={this.state.visibleNodes}
                  onGeneSelect={this.handleGeneSelect}
                  onInternalNodeSelect={this.changeCladeVisibility}
                  onInternalNodeSelect2={this.changeParalogVisibility}
                  onNodeHover={this.handleNodeHover}
                  onNodeUnhover={this.handleNodeUnhover}
                  taxonomy={this.props.taxonomy}
                  overlaysContainer={this.refs.overlaysContainer}
        />
      );
    }

    var zoomer;
    if (this.displayAlignments) {
      var zoomPosition = {
        left: this.alignmentOrigin,
        width: this.alignmentsWidth
      };
      if (!this.MSARange) {
        this.MSARange = {
          MSAStart: 0,
          MSAStop: this.consensusLength
        };
      }
      let colorSchemeDropdown;
      let slider;
      function toTitleCase(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      }
      const colorSchemes = ['clustal', 'zappo', 'taylor','hydrophobicity','helix_propensity','strand_propensity','turn_propensity','buried_index'];
      let items = colorSchemes.map(function (scheme, i) {
        let label = toTitleCase(scheme.replace('_',' '));
        if (scheme === this.state.colorScheme)
          return (
            <MenuItem key={i} eventKey={i} active
              onClick={() => this.setState({colorScheme: scheme})}
            >{label}</MenuItem>
          );
        else
          return (
            <MenuItem key={i} eventKey={i}
              onClick={() => this.setState({colorScheme: scheme})}
            >{label}</MenuItem>
          );
      }.bind(this));
      let nofloat = {float:'none'};
      colorSchemeDropdown = (
        <DropdownButton title="Color Scheme" disabled={this.state.displayMode !== DISPLAY_MSA } style={nofloat}>
          {items}
        </DropdownButton>
      );
      if (this.state.displayMode === DISPLAY_MSA ) {
        slider = (
          <Slider
            min={0}
            max={this.consensusLength}
            defaultValue={this.MSARange.MSAStart}
            onChange={this.handleSliderChange}
          />
        )
      }
      else if (this.state.displayMode === DISPLAY_DOMAINS ) {
        slider = (
          <Range
            min={0}
            max={this.consensusLength}
            pushable={Math.floor(this.alignmentsWidth / this.charWidth)}
            defaultValue={[this.MSARange.MSAStart, this.MSARange.MSAStop]}
            onChange={this.handleSliderChange}
          />
        )
      }
      zoomer = (
        <div className="zoomer" style={zoomPosition}>
          <ButtonToolbar>
            {colorSchemeDropdown}
          </ButtonToolbar>
          {slider}
        </div>
      );
      // }
    }

    return (
      <div>
        <Dropdown id="display-mode-dropdown"
                  onClick={(e)=>e.stopPropagation()}>
          <Dropdown.Toggle>
            Display mode
          </Dropdown.Toggle>
          <Dropdown.Menu onSelect={this.handleModeSelection.bind(this)}>
            <MenuItem eventKey={ DISPLAY_DOMAINS }
                      active={this.state.displayMode === DISPLAY_DOMAINS }>
              Domains
            </MenuItem>
            <MenuItem eventKey={ DISPLAY_MSA }
                      active={this.state.displayMode === DISPLAY_MSA }>
              Multiple Sequence Alignment
            </MenuItem>
            <MenuItem eventKey={ DISPLAY_PHYLOVIEW }
                      active={this.state.displayMode === DISPLAY_PHYLOVIEW }>
              Neighborhood conservation
            </MenuItem>
          </Dropdown.Menu>
        </Dropdown>
        {zoomer}
        <div className="genetree-vis">
          <svg width={this.width} height={height}>
            <g className="tree-wrapper" transform={this.transformTree}>
              {genetree}
            </g>
            {this.renderConsensus()}
            {this.renderAlignments()}
            {this.renderPhyloview()}
          </svg>
          <div ref="overlaysContainer"
               className="overlays"></div>
        </div>
      </div>
    );
  }
});

module.exports = TreeVis;
