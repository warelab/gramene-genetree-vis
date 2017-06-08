import React from 'react';
import PositionedNeighborhood from '../PositionedNeighborhood.jsx';

export default class MSAOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  renderNode(node) {
    if (node.model.gene_stable_id || !node.displayInfo.expanded) {
      let neighborhood = node.model.gene_stable_id
        ? this.props.neighborhoods[node.model.gene_stable_id]
        : {genes : []};
      return (
        <g key={node.model.node_id}>
          <PositionedNeighborhood node={node} width={this.props.width} neighborhood={neighborhood}/>
        </g>
      )
    }
  }

  render() {
    let neighborhoods = this.props.nodes.map(this.renderNode.bind(this));
    return (
      <g>
        <g className="phyloview-controls">
        </g>
        <g className="phyloview-wrapper" transform={`translate(0,${this.props.controlsHeight})`}>
          <svg ref={(svg) => this.alignmentsSVG = svg}
               width={this.props.width}
               height={this.props.height + 2 * this.props.margin + 3}>
            {neighborhoods}
         </svg>
       </g>
      </g>
    )
  }
}
