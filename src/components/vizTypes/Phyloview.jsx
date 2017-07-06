import React from 'react';
import PositionedNeighborhood from '../PositionedNeighborhood.jsx';
import interact from 'interact.js';
import {Tooltip, OverlayTrigger} from 'react-bootstrap';

var d3Scale = require('d3-scale');

function initTreeColors(primary_neighborhood) {
  let treeMap = {};
  let treeIdx = 0;

  var center_idx = Number(primary_neighborhood.center_idx);
  var right_of_idx = primary_neighborhood.genes.length - 1 - center_idx;

  var domain;
  var range = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'darkviolet'];

  //brute force the stupid edge cases.

  if (center_idx > 0 && right_of_idx > 0) {
    domain = [
      0,
      center_idx / 3,
      center_idx * 2 / 3,
      center_idx,
      center_idx + right_of_idx / 3,
      center_idx + right_of_idx * 2 / 3,
      primary_neighborhood.genes.length - 1
    ];

    //handle all the idiot edge cases if there are fewer than 7 genes
    if (center_idx == 1) {
      domain = domain.slice(3);
      domain.unshift(0);
      range = range.slice(2);
    }
    else if (center_idx == 2) {
      domain = domain.slice(3);
      domain.unshift(0, center_idx / 2);
      range = range.slice(1);
    }

    if (center_idx == primary_neighborhood.genes.length - 2) {
      domain = domain.slice(0, domain.length - 3);
      domain.push(primary_neighborhood.genes.length - 1);
      range = range.slice(0, range.length - 2);
    }
    else if (center_idx == primary_neighborhood.genes.length - 3) {
      domain = domain.slice(0, domain.length - 3);
      domain.push(center_idx + right_of_idx / 2, primary_neighborhood.genes.length - 1);
      range = range.slice(0, domain.length);
    }
    //done idiot edge cases

  }
  else if (center_idx == 0) {
    domain = [
      center_idx,
      center_idx + right_of_idx * 1 / 3,
      center_idx + right_of_idx * 2 / 3,
      primary_neighborhood.genes.length - 1
    ];
    range = ['green', 'blue', 'indigo', 'darkviolet'];
  }
  else {
    domain = [
      0,
      center_idx * 1 / 3,
      center_idx * 2 / 3,
      center_idx
    ];
    range = ['red', 'orange', 'yellow', 'green'];
  }

  var scale = d3Scale.scaleLinear()
    .domain(domain)
    .range(range);

  return {scale, treeMap, treeIdx};
}

export default class MSAOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      highlighted : {}
    }
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

            this.neighborhoodsSVG.setAttribute('viewBox', this.getViewBox(false));
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

      this.neighborhoodsSVG.setAttribute('viewBox', this.getViewBox(false));
    }
  }

  getViewBox(forConsensus) {
    let viewBoxMinX = forConsensus ? 0 : this.viewRange.min;
    let viewBoxMinY = 0;
    let viewBoxWidth = forConsensus ? this.totalLength : this.viewRange.max - this.viewRange.min;
    let viewBoxHeight = forConsensus ? this.props.controlsHeight : this.props.height + 2 * this.props.margin;
    return `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`;
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

  renderControls(treeInfo) {
    const tooltip = (
      <Tooltip id="tooltip">resize and drag</Tooltip>
    );
    return (
      <g ref={ g => {
        g
        /*
          // the on tap code to click the viewer around, which doesn't quite work.
          // (it'll fall off the right edge)
        interact(g)
        .on('tap', (event) => {

            let target = event.target;
            let x = event.offsetX;//this.props.width * this.viewRange.min / this.totalLength;
            let y = (parseFloat(this.zoomer.getAttribute('data-y')) || 0);
            this.zoomer.style.webkitTransform =
              this.zoomer.style.transform =
                `translate(${x}px,${y}px)`;
            this.zoomer.setAttribute('data-x', x);
            this.viewRange.min = x * this.totalLength / this.props.width;;
            this.viewRange.max = ( x + parseInt(this.zoomer.getAttribute('data-width'), 10) ) * this.totalLength / this.props.width;
            if (this.viewRange.max > 0.98 * this.totalLength) {
              this.viewRange.max = this.totalLength / this.props.width;
              this.viewRange.min = (this.totalLength - parseInt(this.zoomer.getAttribute('data-width'), 10)) / this.props.width;
            }
            this.neighborhoodsSVG.setAttribute('viewBox', this.getViewBox(false));


        })*/
      } }>
        <g className="consensus-wrapper" transform={`translate(${this.props.xOffset},3)`}>
          <svg width={this.props.width}
               height={this.props.controlsHeight}
               viewBox={this.getViewBox(true)}
               preserveAspectRatio="none">
            {this.renderNode(this.props.queryNode, treeInfo)}
          </svg>
        </g>
        <foreignObject x={this.props.xOffset}
                       y={this.props.yOffset}
                       width={this.props.width}
                       height={this.props.controlsHeight + 6}>
          <OverlayTrigger placement="left" overlay={tooltip}>
            <div className="resize-container">
              <div ref={(e) => this.zoomer = e} className="resize-drag" style={{height:this.props.controlsHeight + 6}}/>
            </div>
          </OverlayTrigger>
        </foreignObject>
      </g>
    )
  }

  renderPhyloview(treeInfo) {

    return (
      <g className="phyloview-wrapper"
         transform={`translate(${this.props.xOffset},${this.props.yOffset + this.props.controlsHeight + this.props.margin - 10})`}>
        <svg ref={(svg) => this.neighborhoodsSVG = svg}
             width={this.props.width}
             height={this.props.height + 2 * this.props.margin}
             viewBox={this.getViewBox(false)}
             preserveAspectRatio="none">
          { this.props.nodes.map((node) => { return this.renderNode(node, treeInfo) } ) }
        </svg>
      </g>
    )
  }

  render() {

    let treeInfo;
    for (let node of this.props.nodes) {
      if (node.model.gene_stable_id || !node.displayInfo.expanded) {
        treeInfo = initTreeColors(this.getNeighborhood(node));
        break;
      }
    };

    return (
      <g>
        {this.renderPhyloview(treeInfo)}
        {this.renderControls(treeInfo)}
      </g>
    )
  }
}
