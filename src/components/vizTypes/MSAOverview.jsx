import React from 'react';
import PositionedAlignment from '../PositionedAlignment.jsx';
import PositionedDomains from '../PositionedDomains.jsx';
import PositionedExonJunctions from '../PositionedExonJunctions.jsx';
import alignmentTools from '../../utils/calculateAlignment';
import positionDomains from '../../utils/positionDomains';
import interact from 'interact.js';
import {Tooltip, OverlayTrigger} from 'react-bootstrap';

export default class MSAOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.zoomerRef = React.createRef();
    this.svgRef = React.createRef();
    this.consensusLength = props.rootNode.model.consensus.sequence.length;
    this.charWidth = 7.2065;
    this.minWidth = props.width*props.width/(this.charWidth*this.consensusLength);
    this.MSARange = props.MSARange;
  }

  componentDidMount() {
    let zoomer = this.zoomerRef.current;
    if (zoomer) {
      let x = this.props.width * this.MSARange.MSAStart / this.consensusLength;
      let y = parseFloat(zoomer.getAttribute('data-y')) || 0;
      zoomer.style.webkitTransform =
        zoomer.style.transform =
          `translate(${x}px,${y}px)`;
      zoomer.style.width = this.props.width * (this.MSARange.MSAStop - this.MSARange.MSAStart)/this.consensusLength + 'px';
      interact(zoomer)
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
            let x = this.props.width * this.MSARange.MSAStart / this.consensusLength;
            let y = (parseFloat(target.getAttribute('data-y')) || 0);
            if (event.deltaRect.left !== 0) {
              // move left edge
              x += event.deltaRect.left;
              if (x < 0) x = 0;
              this.MSARange.MSAStart = x * this.consensusLength / this.props.width;
            }
            if (event.deltaRect.right !== 0) {
              // move right edge
              let right = x + event.rect.width;
              if (right > this.props.width) right = this.props.width;
              this.MSARange.MSAStop = right * this.consensusLength / this.props.width;
            }
            let viewWidth = this.MSARange.MSAStop - this.MSARange.MSAStart;
            target.style.width = this.props.width * viewWidth / this.consensusLength + 'px';
            target.style.webkitTransform =
              target.style.transform =
                `translate(${x}px,${y}px)`;
            target.setAttribute('data-x', x);
            // let vb = `${this.MSARange.MSAStart} -3 ${viewWidth} ${this.props.height}`;
            this.svgRef.current.setAttribute('viewBox', this.getViewBox(false));
            this.props.handleRangeChange(this.MSARange);
          }
        }.bind(this))
    }
  }

  componentDidUpdate() {
    let zoomer = this.zoomerRef.current;
    let x = this.props.width * this.MSARange.MSAStart / this.consensusLength;
    let y = parseFloat(zoomer.getAttribute('data-y')) || 0;
    zoomer.style.webkitTransform =
      zoomer.style.transform =
        `translate(${x}px,${y}px)`;
    zoomer.style.width = this.props.width * (this.MSARange.MSAStop - this.MSARange.MSAStart)/this.consensusLength + 'px';
  }

  dragMoveListener(event) {
    if ((this.MSARange.MSAStop - this.MSARange.MSAStart) < 0.98*this.consensusLength) {
      let target = event.target,
        x = this.props.width * this.MSARange.MSAStart / this.consensusLength + event.dx,
        y = parseFloat(target.getAttribute('data-y')) || 0;
      // respect boundaries
      if (x < 0) x = 0;
      let zoomerWidth = parseFloat(target.style.width);
      if (x + zoomerWidth > this.props.width) x = this.props.width - zoomerWidth;
      let xPosInSeq = this.consensusLength * x / this.props.width;
      let viewWidth = this.MSARange.MSAStop - this.MSARange.MSAStart;
      // if (xPosInSeq + viewWidth > this.consensusLength) {
      //   viewWidth = this.consensusLength - xPosInSeq;
      // }
      // translate the element
      target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';
      // update the position attribute
      target.setAttribute('data-x', x);
      // update the MSA position
      this.MSARange.MSAStart = xPosInSeq;
      this.MSARange.MSAStop = xPosInSeq + viewWidth;
      // let vb = `${xPosInSeq} -3 ${viewWidth} ${this.props.height}`;
      this.svgRef.current.setAttribute('viewBox', this.getViewBox(false));
      this.props.handleRangeChange(this.MSARange);
    }
  }

  getViewBox(forConsensus) {
    let viewBoxMinX = forConsensus ? 0 : this.MSARange.MSAStart;
    let viewBoxMinY = -3;
    let viewBoxWidth = forConsensus ? this.consensusLength : this.MSARange.MSAStop - this.MSARange.MSAStart;
    let viewBoxHeight = forConsensus ? this.props.controlsHeight : this.props.height + 2 * this.props.margin + 3;
    return `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`;
  }

  renderNode(node) {
    if (node.model.gene_stable_id || !node.displayInfo.expanded) {
      let alignment = alignmentTools.calculateAlignment(node);
      let pej;
      if (node.model.exon_junctions) {
        pej = (
          <PositionedExonJunctions node={node} width={this.props.width} alignment={alignment}/>
        )
      }
      let domains = positionDomains(node);
      return (
        <g key={node.model.node_id}>
          {pej}
          <PositionedAlignment
            node={node}
            width={this.props.width}
            stats={this.props.stats}
            domains={domains}
            highlight={false}
            alignment={alignment}/>
          <PositionedDomains
            node={node}
            width={this.props.width}
            stats={this.props.stats}
            alignment={alignment}
            domains={domains}/>
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
            {this.renderNode(this.props.rootNode)}
          </svg>
        </g>
        <foreignObject x={this.props.xOffset}
                       y={this.props.yOffset}
                       width={this.props.width}
                       height={this.props.controlsHeight + 6}>
          <OverlayTrigger placement="left" overlay={tooltip}>
            <div className="resize-container">
              <div ref={this.zoomerRef} className="resize-drag" style={{height:this.props.controlsHeight + 6}}/>
            </div>
          </OverlayTrigger>
        </foreignObject>
      </g>
    )
  }

  renderOverview() {
    return (
      <g className="alignments-wrapper"
         transform={`translate(${this.props.xOffset},${this.props.yOffset + this.props.controlsHeight + this.props.margin - 10})`}>
        <svg ref={this.svgRef}
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
        {this.renderOverview()}
        {this.renderControls()}
      </g>
    )
  }
}
