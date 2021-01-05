import React from 'react';
import PositionedNeighborhood from '../PositionedNeighborhood.jsx';
import interact from 'interact.js';

var d3Scale = require('d3-scale');

function initTreeColors(primary_neighborhood) {
  var range = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'darkviolet'];
  if (primary_neighborhood.strand === 'reverse') {
    range = range.reverse();
  }
  let treeMap = {}; // key is tree_id value is a number based on relative position in neighborhood

  var center_idx = Number(primary_neighborhood.center_idx); // always green
  var center_gene = primary_neighborhood.genes[center_idx];
  let d = 0;
  treeMap[center_gene.tree_id] = d;
  var i, nLeft=0, nRight=0;
  // trees left of center
  for(i=center_idx-1; i >= 0; i--) {
    var gene = primary_neighborhood.genes[i];
    if (gene.tree_id && !treeMap[gene.tree_id]) {
      treeMap[gene.tree_id] = --d;
      nLeft--;
    }
  }
  // trees right of center
  d=0;
  for(i=center_idx+1;i<primary_neighborhood.genes.length;i++) {
    gene = primary_neighborhood.genes[i];
    if (gene.tree_id && !treeMap[gene.tree_id]) {
      treeMap[gene.tree_id] = ++d;
      nRight++;
    }
  }

  var domain = [
    nLeft,
    2*nLeft/3,
    nLeft/3,
    0,
    nRight/3,
    2*nRight/3,
    nRight
  ];
  if (nLeft === 0) {
    domain = domain.slice(3);
    range = range.slice(3);
  }
  if (nRight === 0) {
    domain = domain.reverse().slice(3).reverse();
    range = range.reverse().slice(3).reverse();
  }

  var scale = d3Scale.scaleLinear()
    .domain(domain)
    .range(range);

  if (domain.length === 1) {
    scale = function (value) { return "green" }
  }
  return {scale, treeMap};
}

export default class MSAOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      highlighted : {}
    };
    this.svgRef = React.createRef();
  }

  componentWillMount() {
    this.totalLength = 2 + 2*this.props.numberOfNeighbors;
    this.viewRange = {
      min: this.props.numberOfNeighbors/2,
      max: .75*this.totalLength
    };
    this.minWidth = this.props.width * 4/ (this.totalLength);
    if (this.viewRange.max - this.viewRange.min <= this.minWidth) {
      this.viewRange.min= 0;
      this.viewRange.max= this.totalLength;
    }
  }

  componentDidMount() {
    if (this.zoomer) {
      let x = this.props.width * this.viewRange.min / this.totalLength;
      let y = parseFloat(this.zoomer.getAttribute('data-y')) || 0;
      this.zoomer.style.webkitTransform =
        this.zoomer.style.transform =
          `translate(${x}px,${y}px)`;
      this.zoomer.style.width = this.props.width * (this.viewRange.max - this.viewRange.min)/this.totalLength + 'px';
      interact(this.zoomer)
        .draggable({
          onmove: this.dragMoveListener.bind(this)
        })
        .resizable({
          preserveAspectRatio: false,
          edges: {left: true, right: true, bottom: false, top: false }
        })
        .on('resizemove', function (event) {
          if (event.rect.width > this.minWidth) {
            let target = event.target;
            let x = this.props.width * this.viewRange.min / this.totalLength;
            let y = (parseFloat(target.getAttribute('data-y')) || 0);
            if (event.deltaRect.left !== 0) {
              // move left edge
              x += event.deltaRect.left;
              if (x < 0) x = 0;
              this.viewRange.min = x * this.totalLength / this.props.width;
            }
            if (event.deltaRect.right !== 0) {
              // move right edge
              let right = x + event.rect.width;
              if (right > this.props.width) right = this.props.width;
              this.viewRange.max = right * this.totalLength / this.props.width;
            }

            let viewWidth = this.viewRange.max - this.viewRange.min;
            target.style.width = this.props.width * viewWidth / this.totalLength + 'px';
            target.style.webkitTransform =
              target.style.transform =
                `translate(${x}px,${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-width', parseInt(target.style.width, 10));

            this.svgRef.current.setAttribute('viewBox', this.getViewBox(false));
          }
        }.bind(this))
    }
  }

  dragMoveListener(event) {
    if ((this.viewRange.max - this.viewRange.min + 1) < 0.98*this.totalLength) {
      let target = event.target,
        x = this.props.width * this.viewRange.min / this.totalLength + event.dx,
        y = parseFloat(target.getAttribute('data-y')) || 0;
      // respect boundaries
      if (x < 0) x = 0;
      let zoomerWidth = parseFloat(target.style.width);
      if (x + zoomerWidth > this.props.width) x = this.props.width - zoomerWidth;
      let xPosInSeq = this.totalLength * x / this.props.width;
      let viewWidth = this.viewRange.max - this.viewRange.min;
      // translate the element
      target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';
      // update the position attribute
      target.setAttribute('data-x', x);
      // update the view position
      this.viewRange.min = xPosInSeq;
      this.viewRange.max = xPosInSeq + viewWidth;

      this.svgRef.current.setAttribute('viewBox', this.getViewBox(false));
    }
  }

  getViewBox(forConsensus) {
    let viewBoxMinX = forConsensus ? 0 : this.viewRange.min;
    let viewBoxMinY = 0;
    let viewBoxWidth = forConsensus ? this.totalLength : this.viewRange.max - this.viewRange.min;
    let viewBoxHeight = forConsensus ? this.props.controlsHeight : this.props.height + 2 * this.props.margin;
    return `${viewBoxMinX*20} ${viewBoxMinY} ${viewBoxWidth*20} ${viewBoxHeight}`;
  }

  getNeighborhood(node) {
    return node.model.gene_stable_id
      ? this.props.neighborhoods[node.model.gene_stable_id]
      : {genes : []};
  }

  renderNode(node, treeInfo) {
    if (node.model.gene_stable_id || !node.displayInfo.expanded) {
      let neighborhood = this.getNeighborhood(node);

      return (
        <g key={node.model.node_id}>
          <PositionedNeighborhood
            node={node}
            width={this.props.width}
            totalLength={this.totalLength}
            neighborhood={neighborhood}
            maxNCGGenes={this.props.maxNCGGenes}
            treeInfo={treeInfo}
            highlighted={this.state.highlighted}
            ensemblUrl={this.props.ensemblUrl}
            clickHandler={
              (gene_id, tree_id) => {
                let highlighted = {...this.state.highlighted};
                highlighted[tree_id] = !highlighted[tree_id];
                this.setState({ highlighted });
              }
            }
          />
        </g>
      )
    }
  }

  render() {

    let treeInfo = initTreeColors(this.getNeighborhood(this.props.queryNode));

    return (
      <g className="phyloview-wrapper"
         transform={`translate(${this.props.xOffset},${this.props.yOffset + this.props.controlsHeight + this.props.margin - 10})`}>
        <svg ref={this.svgRef}
             width={this.props.width}
             height={this.props.height + 2 * this.props.margin}
             viewBox={this.getViewBox(false)}
             preserveAspectRatio="none">
          { this.props.nodes.map((node) => { return this.renderNode(node, treeInfo) } ) }
        </svg>
      </g>
    )
  }
}
