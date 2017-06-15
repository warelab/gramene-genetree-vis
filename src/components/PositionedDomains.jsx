import React, {Component} from 'react';
import Domains from './Domains.jsx';
var microsoftBrowser = require('../utils/microsoftBrowser');

class PositionedDomains extends Component {
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    width: React.PropTypes.number.isRequired,
    stats: React.PropTypes.object.isRequired,
    domains: React.PropTypes.object.isRequired,
    alignment: React.PropTypes.object.isRequired
  }

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
        <Domains stats={this.props.stats} width={this.props.width} node={this.props.node} domains={this.props.domains} />
      </g>
    )
  }
};

export default PositionedDomains;
