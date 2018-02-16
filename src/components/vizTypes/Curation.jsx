import React from 'react';
import _ from 'lodash';
const shifty = {
  okay : 'bad',
  bad : 'weird',
  weird: 'okay'
};

export default class Curation extends React.Component {
  constructor(props) {
    super(props);
    let opinion=[];
    props.nodes.forEach((node) => {
      if (node.model.gene_stable_id && props.curatable[node.model.taxon_id]) {
        opinion[node.model.gene_stable_id] = "okay";
      }
    });
    this.state = {opinion}
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps,this.state.props)) {
      let opinion = this.state.opinion;
      let doUpdate = false;
      nextProps.nodes.forEach((node) => {
        const id = node.model.gene_stable_id;
        if (id && !this.state.opinion[id] && nextProps.curatable[node.model.taxon_id]) {
          opinion[id] = "okay";
          doUpdate = true;
        }
      });
      if (doUpdate) this.setState({opinion});
    }
  }

  flipFlop(node) {
    const id = node.model.gene_stable_id;
    let opinion = this.state.opinion;
    opinion[id] = shifty[opinion[id]];
    this.setState({opinion});
  }

  render() {

    return (
      <g className="curation-wrapper"
         transform={`translate(${this.props.xOffset},${this.props.yOffset})`}>
        { this.props.nodes.map((node,idx) => {
          if (node.model.gene_stable_id && this.props.curatable[node.model.taxon_id]) {
            const opinion = this.state.opinion[node.model.gene_stable_id];
            return <foreignObject key={idx}
                                  x={10} y={node.x - 4}
                                  height={this.props.height - 2}
                                  width={this.props.width}>
              <span
                    className={`curation ${opinion}`}
                    onClick={() => this.flipFlop(node)}>{opinion}</span>
            </foreignObject>
          }
        } ) }
      </g>
    )
  }
}
