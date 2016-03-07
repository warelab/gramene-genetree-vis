'use strict';

var React = require('react');

var taxonomyColor = require('../../utils/taxonomyColor');

var Collapsed = React.createClass({
  props: {
    id: React.PropTypes.number.isRequired,
    node: React.PropTypes.object.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onHover: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {};
  },

  select: function() {

  },

  hover: function() {

  },

  unhover: function() {

  },

  className: function () {
    var className;

    className = 'collapsed';

    return className;
  },

  text: function () {
    var node, texts, homologs, orthologs, paralogs;
    node = this.props.node;
    homologs = node.leafNodes().length;
    orthologs = _.get(node, 'displayInfo.orthologs.length') || 0;
    paralogs = _.get(node, 'displayInfo.paralogs.length') || 0;
    texts = [this.props.node.model.taxon_name + ': ' + homologs + ' genes'];

    addToTexts(paralogs, 'paralog');
    //addToTexts(orthologs, 'ortholog');

    function addToTexts(count, type) {
      var text, countText;
      if(count) {
        countText = count === homologs ? 'all' : count;
        text = countText + ' ' + type;
        if (count > 1) text += 's';
        texts.push(text);
      }
    }

    return <text x="36"
                 dy=".35em">{texts.join(', ')}</text>;
  },

  style: function () {
    var color = taxonomyColor(this.props.node);
    return {fill: color, stroke: color};
  },

  triangle: function () {
    var d = 'M0,0 30,8 30,-8 0,0';

    return (
      <path d={d} style={this.style()}/>
    )
  },

  render: function () {
    return (
      <g className={this.className()}
        onMouseOver={this.hover}
        onMouseOut={this.unhover}
        onClick={this.select} >
        {this.triangle()}
        {this.text()}
      </g>
    )
  }
});

module.exports = Collapsed;