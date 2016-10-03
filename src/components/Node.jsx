'use strict';

var React = require('react');

var Collapsed = require('./nodeTypes/Collapsed.jsx');
var Internal = require('./nodeTypes/Internal.jsx');
var Gene = require('./nodeTypes/Gene.jsx');

var Node = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    taxonomy: React.PropTypes.object.isRequired
  },

  getNodeType: function() {
    var node = this.props.node;

    if (node.model.gene_stable_id) {
      return 'Gene';
    }
    else if (!node.displayInfo.expanded) {
      return 'Collapsed';
    }
    else {
      return 'Internal';
    }
  },
  
  getNodeComponent: function () {
    switch(this.getNodeType()) {
      case 'Gene': return Gene;
      case 'Collapsed': return Collapsed;
      case 'Internal': return Internal;
    }
  },

  getInitialState: function () {
    return {};
  },

  handleClick: function () {
    //this.props.onSelect(this.props.node);
  },

  className: function () {
    var className;

    className = 'node';

    return className;
  },

  render: function () {
    return (
      <g className={this.className()}
         //transform={this.transform()}
         onClick={this.handleClick}>
        <rect className="interaction-helper" x="-5" y="-5" width="10" height="10"/>
        {React.createElement(this.getNodeComponent(), this.props)}
      </g>
    )
  }
});

module.exports = Node;