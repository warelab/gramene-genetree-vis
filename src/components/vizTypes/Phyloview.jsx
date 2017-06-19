import React from 'react';
import PositionedNeighborhood from '../PositionedNeighborhood.jsx';
import interact from 'interact.js';
import {Tooltip, OverlayTrigger} from 'react-bootstrap';

export default class MSAOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentWillMount() {
    this.totalLength = 1 + 2*this.props.numberOfNeighbors;
    this.viewRange = {
      min: this.props.numberOfNeighbors/2,
      max: .75*this.totalLength
    };
    this.minWidth = this.props.width / (this.totalLength - 3);
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

  renderNode(node) {
    if (node.model.gene_stable_id || !node.displayInfo.expanded) {
      let neighborhood = node.model.gene_stable_id
        ? this.props.neighborhoods[node.model.gene_stable_id]
        : {genes : []};
      return (
        <g key={node.model.node_id}>
          <PositionedNeighborhood node={node} width={this.props.width} totalLength={this.totalLength} neighborhood={neighborhood}/>
        </g>
      )
    }
  }

  renderControls() {
    const tooltip = (
      <Tooltip id="tooltip">resize and drag</Tooltip>
    );
    return (
      <g>
        <g className="consensus-wrapper" transform={`translate(${this.props.xOffset},3)`}>
          <svg width={this.props.width}
               height={this.props.controlsHeight}
               viewBox={this.getViewBox(true)}
               preserveAspectRatio="none">
            {this.renderNode(this.props.queryNode)}
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

  renderPhyloview() {
    return (
      <g className="phyloview-wrapper"
         transform={`translate(${this.props.xOffset},${this.props.yOffset + this.props.controlsHeight + this.props.margin - 10})`}>
        <svg ref={(svg) => this.neighborhoodsSVG = svg}
             width={this.props.width}
             height={this.props.height + 2 * this.props.margin}
             viewBox={this.getViewBox(false)}
             preserveAspectRatio="none">
          {this.props.nodes.map(this.renderNode.bind(this))}
        </svg>
      </g>
    )
  }

  render() {
    return (
      <g>
        {this.renderPhyloview()}
        {this.renderControls()}
      </g>
    )
  }
}
