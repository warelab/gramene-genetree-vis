import React from 'react';
import microsoftBrowser from '../utils/microsoftBrowser';
import Neighborhood from './Neighborhood.js';

export default class PositionedNeighborhood extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  transform(isStyle) {
    let px = isStyle ? 'px' : '';
    let x = 0;
    let y = this.props.node.x - 2;

    return 'translate(' + x + px + ', ' + y + px + ')';
  }

  render() {
    let props = {};
    if(microsoftBrowser) {
      props.transform = this.transform(false);
    }
    else {
      props.style = { transform: this.transform(true) };
    }

    return (
      <g {...props}>
        <Neighborhood {...this.props} />
      </g>
    )
  }
}
