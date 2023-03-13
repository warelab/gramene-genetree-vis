import React, {Component} from 'react';
import ExonJunctions from './ExonJunctions.js';
var microsoftBrowser = require('../utils/microsoftBrowser');

export default class PositionedExonJunctions extends Component {
  // props: {
  //   id: React.PropTypes.number.isRequired,
  //   node: React.PropTypes.object.isRequired,
  //   width: React.PropTypes.number.isRequired,
  //   alignment: React.PropTypes.object.isRequired
  // }
  //
  constructor(props) {
    super(props);
    this.state = {};
  }

  transform(isStyle) {
    var x, y, px;

    px = isStyle ? 'px' : '';

    x = 0;
    y = this.props.node.x - 2;

    return 'translate(' + x + px + ', ' + y + px + ')';
  }

  render() {
    var props = {};
    if(microsoftBrowser) {
      props.transform = this.transform(false);
    }
    else {
      props.style = { transform: this.transform(true) };
    }

    return (
      <g {...props}>
        <ExonJunctions width={this.props.width} node={this.props.node} alignment={this.props.alignment} />
      </g>
    )
  }
};
